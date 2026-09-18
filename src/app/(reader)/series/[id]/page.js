import { supabaseAdmin } from "@/lib/supabase-admin";
import { auth0 } from "@/lib/auth0";
import { notFound } from "next/navigation";
import { enrichSeries } from "@/lib/series-metadata";
import SeriesDetailClient from "./SeriesDetailClient";

export default async function SeriesPage({ params }) {
  const { id: slugOrId } = await params;

  // 1. Fetch series by slug first, fallback to ID if numeric
  let { data: seriesList } = await supabaseAdmin
    .from("series")
    .select("id, slug, title, cover_url, created_at, author_id")
    .eq("slug", slugOrId);

  let series = seriesList?.[0];

  if (!series && !isNaN(Number(slugOrId))) {
    const { data: byId } = await supabaseAdmin
      .from("series")
      .select("id, slug, title, cover_url, created_at, author_id")
      .eq("id", Number(slugOrId));
    series = byId?.[0];
  }

  if (!series) return notFound();

  // 2. Fetch all chapters for this series ordered by chapter_number ascending
  const { data: chapters } = await supabaseAdmin
    .from("chapters")
    .select("id, chapter_number, title, created_at")
    .eq("series_id", series.id)
    .order("chapter_number", { ascending: true });

  // 3. Fetch real view count from reading_history
  let realViewsCount = 0;
  try {
    const { count } = await supabaseAdmin
      .from("reading_history")
      .select("*", { count: "exact", head: true })
      .eq("series_id", series.id);
    realViewsCount = count || 0;
  } catch {
    realViewsCount = 0;
  }

  // 4. Fetch user's last read chapter if logged in
  let lastReadChapter = null;
  try {
    const session = await auth0.getSession();
    if (session?.user?.sub) {
      const { data: lastRead } = await supabaseAdmin
        .from("reading_history")
        .select("chapters(chapter_number)")
        .eq("user_id", session.user.sub)
        .eq("series_id", series.id)
        .order("read_at", { ascending: false })
        .limit(1);

      if (lastRead?.[0]?.chapters?.chapter_number) {
        lastReadChapter = lastRead[0].chapters.chapter_number;
      }
    }
  } catch {
    // Non-fatal
  }

  // 5. Enrich series with full realtime metadata
  const sortedChapters = chapters || [];
  const latestChapterCreatedAt = sortedChapters.length > 0
    ? sortedChapters[sortedChapters.length - 1].created_at
    : null;

  const enriched = enrichSeries({
    ...series,
    chapterCount: sortedChapters.length,
    chapters: sortedChapters,
    latestChapterCreatedAt,
    viewsCount: realViewsCount,
  });

  return (
    <SeriesDetailClient
      series={enriched}
      chapters={sortedChapters}
      lastReadChapter={lastReadChapter}
    />
  );
}