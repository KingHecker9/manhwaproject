import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { auth0 } from "../../../../../lib/auth0";
import { notFound } from "next/navigation";
import WebtoonsReader from "../WebtoonsReader";

export const dynamic = "force-dynamic";

export default async function ReaderPage({ params }) {
  const { seriesSlug, chapterNumber } = await params;
  const currentChapterNum = Number(chapterNumber);

  // 1. Get the series by slug
  const { data: series } = await supabaseAdmin
    .from("series")
    .select("id, slug, title, cover_url")
    .eq("slug", seriesSlug)
    .single();

  if (!series) return notFound();

  // 2. Get the current chapter by series_id + chapter_number
  const { data: chapter } = await supabaseAdmin
    .from("chapters")
    .select("id, chapter_number, title")
    .eq("series_id", series.id)
    .eq("chapter_number", currentChapterNum)
    .single();

  if (!chapter) return notFound();

  // 3. Get all chapters of this series to determine next / prev and drawer list
  const { data: allChapters } = await supabaseAdmin
    .from("chapters")
    .select("id, chapter_number, title")
    .eq("series_id", series.id)
    .order("chapter_number", { ascending: true });

  const sortedChapters = allChapters || [];
  const currentIndex = sortedChapters.findIndex(
    (c) => Number(c.chapter_number) === currentChapterNum
  );

  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < sortedChapters.length - 1
      ? sortedChapters[currentIndex + 1]
      : null;

  // 4. Log this read for signed-in users (upsert avoids duplicate rows on re-reads)
  try {
    const session = await auth0.getSession();
    if (session?.user?.sub) {
      await supabaseAdmin
        .from("reading_history")
        .upsert(
          {
            user_id: session.user.sub,
            chapter_id: chapter.id,
            series_id: series.id,
            read_at: new Date().toISOString(),
          },
          { onConflict: "user_id,chapter_id" }
        );
    }
  } catch (e) {
    // Non-fatal error
  }

  // 5. Get all pages for this chapter in sequential order
  const { data: pages } = await supabaseAdmin
    .from("pages")
    .select("page_number, image_url")
    .eq("chapter_id", chapter.id)
    .order("page_number", { ascending: true });

  if (!pages || pages.length === 0) return notFound();

  return (
    <WebtoonsReader
      series={series}
      chapter={chapter}
      pages={pages}
      allChapters={sortedChapters}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  );
}