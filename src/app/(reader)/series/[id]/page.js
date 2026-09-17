import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { auth0 } from "../../../../lib/auth0";
import { notFound } from "next/navigation";
import { enrichSeries } from "../../../../lib/series-metadata";
import SeriesDetailClient from "./SeriesDetailClient";

export const revalidate = 60;

export default async function SeriesPage({ params }) {
  const { id: slugOrId } = await params;

  // 1. Fetch series by slug first, fallback to ID if numeric
  let { data: series } = await supabaseAdmin
    .from("series")
    .select("id, slug, title, cover_url, created_at")
    .eq("slug", slugOrId)
    .single();

  if (!series && !isNaN(Number(slugOrId))) {
    const { data: byId } = await supabaseAdmin
      .from("series")
      .select("id, slug, title, cover_url, created_at")
      .eq("id", Number(slugOrId))
      .single();
    series = byId;
  }

  if (!series) return notFound();

  // 2. Fetch all chapters for this series ordered by chapter_number ascending
  const { data: chapters } = await supabaseAdmin
    .from("chapters")
    .select("id, chapter_number, title, created_at")
    .eq("series_id", series.id)
    .order("chapter_number", { ascending: true });

  // 3. Enrich series with full curated/stored metadata
  const enriched = enrichSeries({
    ...series,
    chapterCount: chapters?.length || 0,
    chapters: chapters || [],
  });

  // 4. Check user reading history if authenticated
  let lastReadChapter = null;
  try {
    const session = await auth0.getSession();
    if (session?.user?.sub) {
      const { data: userHistory } = await supabaseAdmin
        .from("reading_history")
        .select("chapter_id, read_at, chapters(chapter_number)")
        .eq("user_id", session.user.sub)
        .eq("series_id", series.id)
        .order("read_at", { ascending: false })
        .limit(1)
        .single();

      if (userHistory?.chapters?.chapter_number) {
        lastReadChapter = userHistory.chapters.chapter_number;
      }
    }
  } catch (err) {
    // Non-fatal if session read fails
  }

  return (
    <SeriesDetailClient
      series={enriched}
      chapters={chapters || []}
      lastReadChapter={lastReadChapter}
    />
  );
}