import { supabaseAdmin } from "@/lib/supabase-admin";
import { auth0 } from "@/lib/auth0";
import { enrichSeries } from "@/lib/series-metadata";
import CatalogClient from "./CatalogClient";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  // 1. Fetch all series
  const { data: seriesList, error: seriesError } = await supabaseAdmin
    .from("series")
    .select("id, slug, title, cover_url, created_at, chapters(id, created_at, chapter_number)")
    .order("created_at", { ascending: false });

  if (seriesError) {
    console.error("Error fetching series in CatalogPage:", seriesError);
  }

  // 2. Fetch real view counts from reading_history for each series
  const seriesIds = (seriesList || []).map((s) => s.id);
  const viewCountMap = {};

  if (seriesIds.length > 0) {
    try {
      const { data: historyCounts } = await supabaseAdmin
        .from("reading_history")
        .select("series_id");

      if (historyCounts) {
        historyCounts.forEach((row) => {
          if (row.series_id) {
            viewCountMap[row.series_id] = (viewCountMap[row.series_id] || 0) + 1;
          }
        });
      }
    } catch (e) {
      console.warn("Could not calculate series view counts:", e.message);
    }
  }

  // 3. Enrich each series with 100% realtime metrics
  const formatted = (seriesList || []).map((s) => {
    const chapters = s.chapters || [];
    const chapterCount = chapters.length;

    // Find latest chapter date
    let latestChapterCreatedAt = null;
    if (chapters.length > 0) {
      const sorted = [...chapters].sort((a, b) => Number(b.chapter_number) - Number(a.chapter_number));
      latestChapterCreatedAt = sorted[0]?.created_at || null;
    }

    const realViews = viewCountMap[s.id] || 0;

    return enrichSeries({
      id: s.id,
      slug: s.slug,
      title: s.title,
      cover_url: s.cover_url,
      cover: s.cover_url,
      chapterCount,
      latestChapterCreatedAt,
      viewsCount: realViews,
      featured: true, // All published series featured in rotation
    });
  });

  // 4. Fetch real logged-in reader history for Continue Reading
  let userHistory = [];
  try {
    const session = await auth0.getSession();
    if (session?.user?.sub) {
      const { data: reads } = await supabaseAdmin
        .from("reading_history")
        .select("series_id, chapter_id, read_at, chapters(chapter_number, title), series(slug, title, cover_url)")
        .eq("user_id", session.user.sub)
        .order("read_at", { ascending: false })
        .limit(10);

      userHistory = (reads || []).map((r) => ({
        series_id: r.series_id,
        series_slug: r.series?.slug,
        series_title: r.series?.title,
        chapter_number: r.chapters?.chapter_number,
        chapter_title: r.chapters?.title,
        read_at: r.read_at,
        cover: r.series?.cover_url,
      }));
    }
  } catch (err) {
    console.warn("Could not fetch user history in CatalogPage:", err.message);
  }

  return <CatalogClient seriesList={formatted} userHistory={userHistory} />;
}