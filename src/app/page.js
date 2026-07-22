// import Link from 'next/link';

// export default function Home() {
//   const chapters = [
//     { id: 1, title: 'The Awakening', date: 'Jul 2026' },
//     { id: 2, title: 'The First Encounter', date: 'Jul 2026' },
//     { id: 3, title: 'Leveling Up', date: 'Jul 2026' },
//   ];

//   return (
//     <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
//       <header className="border-b border-[var(--rule)] pb-8 mb-12">
//         <p className="font-mono-ed text-xs tracking-[0.2em] uppercase text-[var(--ink-soft)] mb-3">
//           Studio Reader — Vol. 01
//         </p>
//         <h1 className="font-display text-5xl md:text-6xl font-medium tracking-tight text-[var(--ink)]">
//           Official Reader
//         </h1>
//         <p className="font-body text-[var(--ink-soft)] text-sm mt-3 max-w-md">
//           High-quality releases, direct from the creator, in reading order.
//         </p>
//       </header>

//       <section>
//         <h2 className="font-mono-ed text-xs tracking-[0.2em] uppercase text-[var(--ink-soft)] mb-6">
//           Contents
//         </h2>
//         <div>
//           {chapters.map((chap) => (
//             <Link
//               key={chap.id}
//               href={`/reader?chapter=${chap.id}`}
//               className="group flex items-baseline gap-6 py-6 border-b border-[var(--rule)] hover:bg-black/[0.02] transition-colors -mx-2 px-2"
//             >
//               <span className="font-display text-4xl md:text-5xl text-[var(--ink)]/10 group-hover:text-[var(--accent)]/20 transition-colors leading-none w-16 md:w-20 shrink-0">
//                 {String(chap.id).padStart(2, '0')}
//               </span>
//               <span className="flex-1 min-w-0">
//                 <span className="font-display text-lg md:text-xl block text-[var(--ink)] truncate">
//                   {chap.title}
//                 </span>
//                 <span className="font-mono-ed text-xs text-[var(--ink-soft)]">
//                   {chap.date}
//                 </span>
//               </span>
//               <span className="font-mono-ed text-xs text-[var(--ink-soft)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all shrink-0">
//                 Read →
//               </span>
//             </Link>
//           ))}
//         </div>
//       </section>
//     </main>
//   );
// }

import Link from 'next/link';

export default function CatalogPage() {
  const seriesList = [
    {
      id: 'solo-leveling',
      title: 'Shadow Monarch',
      author: 'Studio Alpha',
      cover: 'https://picsum.photos/400/600?random=10',
      chapters: 12,
    },
    {
      id: 'tower-runner',
      title: 'Tower Runner',
      author: 'Creator Beta',
      cover: 'https://picsum.photos/400/600?random=20',
      chapters: 8,
    },
    {
      id: 'immortal-swordsman',
      title: 'Immortal Swordsman',
      author: 'Studio Gamma',
      cover: 'https://picsum.photos/400/600?random=30',
      chapters: 24,
    },
  ];

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Browse Titles</h1>
        <p className="text-neutral-400 text-sm mt-1">Select a manhwa series to start reading.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {seriesList.map((series) => (
          <div
            key={series.id}
            className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-blue-500 transition group flex flex-col"
          >
            <div className="relative aspect-[2/3] bg-neutral-800 overflow-hidden">
              <img
                src={series.cover}
                alt={series.title}
                className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-lg group-hover:text-blue-400 transition">
                  {series.title}
                </h2>
                <p className="text-xs text-neutral-400 mt-1">By {series.author}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-neutral-500">{series.chapters} Chapters</span>
                <Link
                  href={`/series/${series.id}`}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded transition text-white"
                >
                  Read
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}