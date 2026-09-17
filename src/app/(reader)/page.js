import { supabaseAdmin } from "../../lib/supabase-admin";
import { auth0 } from "../../lib/auth0";
import { enrichSeries } from "../../lib/series-metadata";
import CatalogClient from "./CatalogClient";

export const revalidate = 60;

export default async function CatalogPage() {
  // Fetch series with chapters count
  const { data: seriesList, error: seriesError } = await supabaseAdmin
    .from("series")
    .select("id, slug, title, cover_url, created_at, chapters(id, chapter_number, title, created_at)");

  if (seriesError) {
    console.error("Error fetching series:", seriesError);
  }

  // Enrich each series with rich metadata and latest chapter info
  const formatted = (seriesList || []).map((s) => {
    const chapters = (s.chapters || []).sort(
      (a, b) => Number(b.chapter_number) - Number(a.chapter_number)
    );
    const latestChapter = chapters[0] || null;

    return enrichSeries({
      ...s,
      chapterCount: chapters.length,
      latestChapter,
      chapters,
    });
  });

  // Fetch logged in user reading history if authenticated
  let userHistory = [];
  try {
    const session = await auth0.getSession();
    if (session?.user?.sub) {
      const { data: historyRows } = await supabaseAdmin
        .from("reading_history")
        .select("chapter_id, series_id, read_at, chapters(chapter_number, title)")
        .eq("user_id", session.user.sub)
        .order("read_at", { ascending: false })
        .limit(6);

      if (historyRows) {
        userHistory = historyRows.map((r) => ({
          series_id: r.series_id,
          chapter_id: r.chapter_id,
          chapter_number: r.chapters?.chapter_number || 1,
          chapter_title: r.chapters?.title || '',
          read_at: r.read_at,
        }));
      }
    }
  } catch (err) {
    console.error("Error loading session/history in CatalogPage:", err);
  }

  return <CatalogClient seriesList={formatted} userHistory={userHistory} />;
}