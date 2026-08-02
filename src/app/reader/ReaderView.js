'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ReaderView({ seriesId, seriesTitle, chapter }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showControls, setShowControls] = useState(true);

  const pages = chapter.pages;

  return (
    <div className="relative min-h-screen bg-black text-white select-none">
      {/* Top Navigation Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md px-6 py-4 flex justify-between items-center transition-transform duration-300 ${
          showControls ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`/series/${seriesId}`}
            className="text-xs bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded text-neutral-300 shrink-0"
          >
            ← {seriesTitle}
          </Link>
          <h1 className="text-sm font-semibold truncate">
            Chapter {chapter.number}: {chapter.title}
          </h1>
        </div>
        <span className="text-xs text-neutral-500 shrink-0">{pages.length} pages</span>
      </header>

      {/* Main Vertical Reader Canvas */}
      <main
        onClick={() => setShowControls((prev) => !prev)}
        className="pt-16 pb-24 flex flex-col items-center min-h-screen cursor-pointer"
      >
        <div
          style={{ width: `${zoomLevel}%` }}
          className="max-w-2xl w-full flex flex-col items-center transition-all duration-200"
        >
          {pages.map((src, idx) => (
            <div key={idx} className="relative w-full aspect-[2/3]">
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
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-4 transition-transform duration-300 ${
          showControls ? 'translate-y-0' : 'translate-y-28'
        }`}
      >
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 10, 60))}
          className="text-xs font-medium text-neutral-400 hover:text-white"
        >
          Zoom Out
        </button>
        <span className="text-xs font-mono text-blue-400">{zoomLevel}%</span>
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 10, 140))}
          className="text-xs font-medium text-neutral-400 hover:text-white"
        >
          Zoom In
        </button>
      </footer>
    </div>
  );
}