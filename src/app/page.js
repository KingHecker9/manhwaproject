'use client';

import { useState } from 'react';
import Link from 'next/link';

const seriesList = [
  {
    id: 'solo-leveling',
    title: 'Shadow Monarch',
    author: 'Studio Alpha',
    cover: 'https://picsum.photos/400/600?random=10',
    chapters: 12,
    genre: 'Action',
  },
  {
    id: 'tower-runner',
    title: 'Tower Runner',
    author: 'Creator Beta',
    cover: 'https://picsum.photos/400/600?random=20',
    chapters: 8,
    genre: 'Fantasy',
  },
  {
    id: 'immortal-swordsman',
    title: 'Immortal Swordsman',
    author: 'Studio Gamma',
    cover: 'https://picsum.photos/400/600?random=30',
    chapters: 24,
    genre: 'Action',
  },
  {
    id: 'crimson-blade',
    title: 'Crimson Blade',
    author: 'Studio Delta',
    cover: 'https://picsum.photos/400/600?random=40',
    chapters: 31,
    genre: 'Action',
  },
  {
    id: 'ember-kingdom',
    title: 'Ember Kingdom',
    author: 'Creator Epsilon',
    cover: 'https://picsum.photos/400/600?random=50',
    chapters: 15,
    genre: 'Fantasy',
  },
  {
    id: 'moonlit-vows',
    title: 'Moonlit Vows',
    author: 'Studio Zeta',
    cover: 'https://picsum.photos/400/600?random=60',
    chapters: 19,
    genre: 'Romance',
  },
  {
    id: 'second-chance-love',
    title: 'Second Chance Love',
    author: 'Creator Eta',
    cover: 'https://picsum.photos/400/600?random=70',
    chapters: 27,
    genre: 'Romance',
  },
  {
    id: 'broken-family-ties',
    title: 'Broken Family Ties',
    author: 'Studio Theta',
    cover: 'https://picsum.photos/400/600?random=80',
    chapters: 22,
    genre: 'Drama',
  },
  {
    id: 'the-inheritance',
    title: 'The Inheritance',
    author: 'Creator Iota',
    cover: 'https://picsum.photos/400/600?random=90',
    chapters: 14,
    genre: 'Drama',
  },
  {
    id: 'office-shenanigans',
    title: 'Office Shenanigans',
    author: 'Studio Kappa',
    cover: 'https://picsum.photos/400/600?random=100',
    chapters: 33,
    genre: 'Comedy',
  },
  {
    id: 'my-roommate-is-a-ghost',
    title: 'My Roommate Is a Ghost',
    author: 'Creator Lambda',
    cover: 'https://picsum.photos/400/600?random=110',
    chapters: 18,
    genre: 'Comedy',
  },
  {
    id: 'galaxy-drift',
    title: 'Galaxy Drift',
    author: 'Studio Mu',
    cover: 'https://picsum.photos/400/600?random=120',
    chapters: 9,
    genre: 'Sci-Fi',
  },
  {
    id: 'last-transmission',
    title: 'Last Transmission',
    author: 'Creator Nu',
    cover: 'https://picsum.photos/400/600?random=130',
    chapters: 21,
    genre: 'Sci-Fi',
  },
];

const categories = ['All', 'Action', 'Fantasy', 'Romance', 'Drama', 'Comedy', 'Sci-Fi'];

function SeriesCard({ series, rank, fixedWidth }) {
  return (
    <Link
      href={`/series/${series.id}`}
      className={`group block ${fixedWidth ? 'w-32 snap-start' : 'w-36 shrink-0'}`}
    >
      <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-neutral-100">
        <img
          src={series.cover}
          alt={series.title}
          className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
        />
        {rank && (
          <span className="absolute top-2 left-2 text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            {rank}
          </span>
        )}
      </div>
      <h3 className="mt-2 text-sm font-bold text-neutral-900 truncate group-hover:text-emerald-600 transition">
        {series.title}
      </h3>
      <p className="text-xs text-neutral-500">{series.genre}</p>
    </Link>
  );
}

export default function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered =
    activeCategory === 'All' ? seriesList : seriesList.filter((s) => s.genre === activeCategory);

  const ranked = [...seriesList].sort((a, b) => b.chapters - a.chapters);
  const seriesByGenre = categories
    .filter((c) => c !== 'All')
    .map((cat) => ({ cat, items: seriesList.filter((s) => s.genre === cat) }))
    .filter((group) => group.items.length > 0);

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

      {/* Trending row — fixed at 2 rows, extra items scroll sideways instead of growing the row */}
      <section className="mb-12">
        <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500 mb-4">
          Trending Now
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

      {/* DESKTOP: tabs + fixed-width wrapping grid (no stretching with few items) */}
      <section className="hidden sm:block">
        <h2 className="text-lg font-bold text-neutral-900 mb-4">Popular Series by Category</h2>
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                activeCategory === cat
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="flex flex-wrap gap-5">
            {filtered.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No series in this category yet.</p>
        )}
      </section>

      {/* MOBILE: stacked swipeable rows, one per category — scroll down for the next one */}
      <div className="sm:hidden">
        {seriesByGenre.map(({ cat, items }) => (
          <section key={cat} className="mb-12">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">{cat}</h2>
            <div
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6
                         touch-pan-x [overscroll-behavior-x:contain]"
            >
              {items.map((series) => (
                <SeriesCard key={series.id} series={series} fixedWidth />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}