import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { notFound } from "next/navigation";
import Image from 'next/image';

export default async function ReaderPage({ params }) {
  const { seriesSlug, chapterNumber } = await params;

  // 1. Get the series by slug
  const { data: series } = await supabaseAdmin
    .from("series")
    .select("id, title")
    .eq("slug", seriesSlug)
    .single();

  if (!series) return notFound();

  // 2. Get the chapter by series_id + chapter_number
  const { data: chapter } = await supabaseAdmin
    .from("chapters")
    .select("id, chapter_number, title")
    .eq("series_id", series.id)
    .eq("chapter_number", Number(chapterNumber))
    .single();

  if (!chapter) return notFound();

  // 3. Get all pages for this chapter, in order
  const { data: pages } = await supabaseAdmin
    .from("pages")
    .select("page_number, image_url")
    .eq("chapter_id", chapter.id)
    .order("page_number", { ascending: true });

  if (!pages || pages.length === 0) return notFound();

  return (
    <main className="min-h-screen bg-neutral-950">
      <header className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 py-3 px-4">
        <h1 className="text-white text-sm font-semibold text-center">
          {series.title} — Chapter {chapter.chapter_number}
          {chapter.title ? `: ${chapter.title}` : ""}
        </h1>
      </header>

      <div className="max-w-3xl mx-auto flex flex-col">
        {pages.map((page) => (
          <Image
            key={page.page_number}
            src={page.image_url}
            alt={`Page ${page.page_number}`}
            width={800}
            height={1200}
            className="w-full h-auto block"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        ))}
      </div>

      <footer className="text-center text-neutral-500 text-xs py-8">
        End of Chapter {chapter.chapter_number}
      </footer>
    </main>
  );
}
