'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ReaderPage() {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showControls, setShowControls] = useState(true);

  // Mock chapter images using webtoon aspect ratios
  const pages = [
    'https://picsum.photos/800/1200?random=1',
    'https://picsum.photos/800/1200?random=2',
    'https://picsum.photos/800/1200?random=3',
    'https://picsum.photos/800/1200?random=4',
  ];

  return (
    <div className="relative min-h-screen bg-[var(--paper)] text-[var(--ink)] select-none">
      {/* Top Navigation Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-[var(--paper)]/95 backdrop-blur-sm border-b border-[var(--rule)] px-6 py-4 flex justify-between items-center transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-mono-ed text-xs uppercase tracking-wide text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors"
          >
            ← Contents
          </Link>
          <span className="w-px h-4 bg-[var(--rule)]" />
          <h1 className="font-display text-sm md:text-base truncate">
            Chapter 1 — The Awakening
          </h1>
        </div>
        <span className="font-mono-ed text-xs text-[var(--ink-soft)] shrink-0">
          {pages.length} pages
        </span>
      </header>

      {/* Main Vertical Reader Canvas */}
      <main
        onClick={() => setShowControls((prev) => !prev)}
        className="pt-24 pb-28 flex flex-col items-center min-h-screen cursor-pointer"
      >
        <div
          style={{ width: `${zoomLevel}%` }}
          className="max-w-2xl w-full flex flex-col items-center transition-all duration-200"
        >
          {pages.map((src, idx) => (
            <div key={idx} className="relative w-full aspect-[2/3] border-y border-[var(--rule)]">
              <Image
                src={src}
                alt={`Page ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-contain"
                priority={idx < 2}
              />
            </div>
          ))}
        </div>
      </main>

      {/* Floating Control Bar */}
      <footer
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[var(--paper)]/95 backdrop-blur-sm border border-[var(--rule)] px-6 py-3 rounded-full flex items-center gap-4 transition-transform duration-300 shadow-sm ${
          showControls ? 'translate-y-0' : 'translate-y-28'
        }`}
      >
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
          className="font-mono-ed text-xs uppercase tracking-wide text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors"
        >
          Zoom Out
        </button>
        <span className="font-mono-ed text-xs text-[var(--accent)] w-10 text-center">
          {zoomLevel}%
        </span>
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 10, 140))}
          className="font-mono-ed text-xs uppercase tracking-wide text-[var(--ink-soft)] hover:text-[var(--accent)] transition-colors"
        >
          Zoom In
        </button>
      </footer>
    </div>
  );
}