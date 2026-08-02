'use client';

function SeriesCard({ series, rank, fixedWidth }) {
  return (
    <a
      href={`/series/${series.id}`}
      className={`group block ${fixedWidth ? 'w-32 snap-start' : 'w-36 shrink-0'}`}
    >
      <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-neutral-100">
        {series.cover ? (
          <img
            src={series.cover}
            alt={series.title}
            className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xs px-2 text-center">
            No cover yet
          </div>
        )}
        {rank && (
          <span className="absolute top-2 left-2 text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {rank}
          </span>
        )}
      </div>
      <h3 className="mt-2 text-sm font-bold text-neutral-900 truncate group-hover:text-emerald-600 transition">
        {series.title}
      </h3>
      <p className="text-xs text-neutral-500">{series.chapterCount} chapters</p>
    </a>
  );
}

export default function CatalogClient({ seriesList }) {
  const ranked = [...seriesList].sort((a, b) => b.chapterCount - a.chapterCount);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 bg-white min-h-screen">
      {/* Top nav */}
      <header className="flex items-center justify-between border-b border-neutral-200 pb-4 mb-10">
        <span className="text-xl font-black tracking-tight text-neutral-900">STUDIO READER</span>
        <nav className="hidden sm:flex gap-6 text-sm font-semibold text-neutral-600">
          <span className="text-neutral-900">Originals</span>
          <span>Categories</span>
          <span>Rankings</span>
        </nav>
      </header>

      {seriesList.length === 0 ? (
        <p className="text-sm text-neutral-500">
          No series uploaded yet — head to the Author Portal to publish your first chapter.
        </p>
      ) : (
        <>
          {/* Trending — fixed 2 rows, extra series scroll sideways instead of growing the page */}
          <section className="mb-12">
            <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500 mb-4">
              Most Chapters
            </h2>
            <div
              className="grid grid-rows-2 grid-flow-col auto-cols-[8rem] gap-4 overflow-x-auto pb-2
                         -mx-6 px-6 sm:mx-0 sm:px-0
                         touch-pan-x [overscroll-behavior-x:contain] snap-x snap-mandatory"
            >
              {ranked.map((series, idx) => (
                <SeriesCard key={series.id} series={series} rank={idx + 1} fixedWidth />
              ))}
            </div>
          </section>

          {/* All series — fixed-width wrapping grid, no stretching with few items */}
          <section>
            <h2 className="text-lg font-bold text-neutral-900 mb-4">All Series</h2>
            <div className="flex flex-wrap gap-5">
              {seriesList.map((series) => (
                <SeriesCard key={series.id} series={series} />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}