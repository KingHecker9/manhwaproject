import Link from 'next/link';

export default async function SeriesDetailPage({ params }) {
const { id } = await params;
  // Mock list of chapters for the selected series
  const chapters = Array.from({ length: 12 }, (_, i) => ({
    number: i + 1,
    title: `Chapter ${i + 1}`,
    date: 'Jul 2026',
  }));

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <Link href="/" className="text-xs text-neutral-400 hover:text-white transition mb-6 inline-block">
        ← Back to Library
      </Link>

      <header className="border-b border-neutral-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight capitalize text-blue-500">
          {id.replace('-', ' ')}
        </h1>
        <p className="text-neutral-400 text-sm mt-1">Select a chapter to begin continuous scrolling.</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold mb-2">Available Chapters</h2>
        <div className="grid gap-2">
          {chapters.map((chap) => (
            <Link
              key={chap.number}
              href={`/reader?series=${id}&chapter=${chap.number}`}
              className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-lg hover:border-blue-500 transition"
            >
              <span className="font-medium text-sm">{chap.title}</span>
              <span className="text-xs text-neutral-500">{chap.date}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}