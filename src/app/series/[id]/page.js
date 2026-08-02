import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSeries } from '../../../lib/chapters';

export default async function SeriesDetailPage({ params }) {
  const { id } = await params;
  const series = getSeries(id);

  if (!series) notFound();

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <Link href="/" className="text-xs text-neutral-400 hover:text-white transition mb-6 inline-block">
        ← Back to Library
      </Link>

      <header className="border-b border-neutral-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight capitalize text-blue-500">
          {series.title}
        </h1>
        <p className="text-neutral-400 text-sm mt-1">Select a chapter to begin continuous scrolling.</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold mb-2">Available Chapters</h2>
        {series.chapters.length === 0 ? (
          <p className="text-sm text-neutral-500">No chapters uploaded yet.</p>
        ) : (
          <div className="grid gap-2">
            {series.chapters.map((chap) => (
              <Link
                key={chap.number}
                href={`/reader?series=${id}&chapter=${chap.number}`}
                className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-lg hover:border-blue-500 transition"
              >
                <span className="font-medium text-sm">
                  Chapter {chap.number}: {chap.title}
                </span>
                <span className="text-xs text-neutral-500">{chap.pages.length} pages</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}