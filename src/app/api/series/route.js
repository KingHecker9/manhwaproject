import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { enrichSeries } from "@/lib/series-metadata";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch all series from database
    const { data: seriesList, error: seriesError } = await supabaseAdmin
      .from("series")
      .select("id, slug, title, cover_url, created_at, chapters(id, created_at, chapter_number)")
      .order("created_at", { ascending: false });

    if (seriesError) {
      console.error("Supabase series fetch error in /api/series:", seriesError);
      return NextResponse.json({ error: seriesError.message }, { status: 500 });
    }

    // 2. Fetch real view counts from reading_history
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
        console.warn("Could not calculate series view counts in /api/series:", e.message);
      }
    }

    // 3. Format and enrich each series
    const enriched = (seriesList || []).map((s) => {
      const chapters = s.chapters || [];
      const chapterCount = chapters.length;

      let latestChapterCreatedAt = null;
      let latestChapter = null;
      if (chapters.length > 0) {
        const sorted = [...chapters].sort(
          (a, b) => Number(b.chapter_number) - Number(a.chapter_number)
        );
        latestChapterCreatedAt = sorted[0]?.created_at || null;
        latestChapter = sorted[0] || null;
      }

      const realViews = viewCountMap[s.id] || 0;

      return enrichSeries({
        id: s.id,
        slug: s.slug,
        title: s.title,
        cover_url: s.cover_url,
        cover: s.cover_url,
        chapterCount,
        latestChapter,
        latestChapterCreatedAt,
        viewsCount: realViews,
        featured: true,
      });
    });

    return NextResponse.json({ series: enriched });
  } catch (err) {
    console.error("API series error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
