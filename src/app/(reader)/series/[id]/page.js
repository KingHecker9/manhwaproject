import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function SeriesPage({ params }) {
  const { id: slug } = await params;

  const { data: series } = await supabaseAdmin
    .from("series")
    .select("id, slug, title, cover_url")
    .eq("slug", slug)
    .single();

  if (!series) return notFound();

  const { data: chapters } = await supabaseAdmin
    .from("chapters")
    .select("id, chapter_number, title")
    .eq("series_id", series.id)
    .order("chapter_number", { ascending: true });

  return (
    <main className="min-h-screen bg-neutral-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">{series.title}</h1>

        {(!chapters || chapters.length === 0) && (
          <p className="text-neutral-500 text-sm">No chapters uploaded yet.</p>
        )}

        <div className="space-y-2">
          {chapters?.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/reader/${series.slug}/${chapter.chapter_number}`}
              className="block bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white hover:border-indigo-500 transition"
            >
              Chapter {chapter.chapter_number}
              {chapter.title ? `: ${chapter.title}` : ""}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}