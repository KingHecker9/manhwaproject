"use client";
import Image from "next/image";

function SeriesCard({ series, rank, fixedWidth }) {
  return (
    <a
      href={`/series/${series.id}`}
      className={`group block ${fixedWidth ? "w-32 snap-start" : "w-36 shrink-0"}`}
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-orange-100 shadow-sm">
        {series.cover ? (
          // ...
          <Image
            src={series.cover}
            alt={series.title}
            fill
            className="object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-orange-300 text-xs px-2 text-center">
            No cover yet
          </div>
        )}
        {rank && (
          <span className="absolute top-2 left-2 text-3xl font-serif-display font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {rank}
          </span>
        )}
      </div>
      <h3 className="mt-2 font-serif-display text-base font-semibold text-stone-900 truncate group-hover:text-rose-600 transition">
        {series.title}
      </h3>
      <p className="text-xs text-stone-500">{series.chapterCount} chapters</p>
    </a>
  );
}

export default function CatalogClient({ seriesList }) {
  const ranked = [...seriesList].sort(
    (a, b) => b.chapterCount - a.chapterCount,
  );

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 bg-orange-50 min-h-screen">
      {seriesList.length === 0 ? (
        <p className="text-sm text-stone-500">
          No series uploaded yet — head to the Author Portal to publish your
          first chapter.
        </p>
      ) : (
        <>
          {/* Trending — fixed 2 rows, extra series scroll sideways instead of growing the page */}
          <section className="mb-12">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-500 mb-4">
              Chapters
            </h2>
            <div
              className="grid grid-rows-2 grid-flow-col auto-cols-[8rem] gap-4 overflow-x-auto pb-2
                         -mx-6 px-6 sm:mx-0 sm:px-0
                         [touch-action:pan-x_pan-y] [overscroll-behavior-x:contain] snap-x snap-mandatory"
            >
              {ranked.map((series, idx) => (
                <SeriesCard
                  key={series.id}
                  series={series}
                  rank={idx + 1}
                  fixedWidth
                />
              ))}
            </div>
          </section>

          {/* All series — fixed-width wrapping grid, no stretching with few items */}
          <section>
            <h2 className="font-serif-display text-xl font-semibold text-stone-900 mb-4">
              All Series
            </h2>
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
