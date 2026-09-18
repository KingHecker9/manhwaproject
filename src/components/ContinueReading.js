'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, ArrowRight, Play } from 'lucide-react';

export default function ContinueReading({ seriesList = [], initialHistory = [] }) {
  const [historyItems, setHistoryItems] = useState(initialHistory);

  useEffect(() => {
    try {
      // Also check client-side local storage for guest readers or offline reads
      const localHistory = JSON.parse(localStorage.getItem('reading_history') || '[]');
      if (initialHistory.length === 0 && localHistory.length > 0) {
        setHistoryItems(localHistory);
      }
    } catch (e) {}
  }, [initialHistory]);

  if (!historyItems || historyItems.length === 0) return null;

  // Map history to actual series
  const activeReads = historyItems
    .map((item) => {
      const series = seriesList.find((s) => s.id === item.series_id || s.slug === item.series_slug);
      if (!series) return null;
      return {
        ...series,
        lastChapter: item.chapter_number || item.last_chapter || 1,
        lastReadAt: item.read_at || item.last_read_at,
        progress: item.progress_percentage || Math.min(100, Math.round(((item.chapter_number || 1) / (series.chapterCount || 1)) * 100)),
      };
    })
    .filter(Boolean);

  if (activeReads.length === 0) return null;

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" strokeWidth={2} />
          <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[var(--text-main)]">
            Continue Reading
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeReads.slice(0, 3).map((item) => (
          <Link
            key={item.id}
            href={`/reader/${item.slug}/${item.lastChapter}`}
            className="flex items-center gap-3.5 p-3.5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40 shadow-xs hover-lift transition-all group"
          >
            <div className="relative w-16 h-22 rounded-2xl overflow-hidden bg-[var(--bg-surface)] shrink-0 border border-[var(--border-subtle)]">
              {item.cover ? (
                <Image
                  src={item.cover}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-108 transition-transform duration-300 ease-out"
                />
              ) : null}
            </div>

            <div className="flex-1 min-w-0">
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-1">
                Resume Ch. {item.lastChapter}
              </span>
              <h3 className="text-sm font-bold text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                {item.title}
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                Ch. {item.lastChapter} of {item.chapterCount} • {item.progress}% read
              </p>

              {/* Progress bar */}
              <div className="w-full bg-[var(--bg-surface)] h-1.5 rounded-full overflow-hidden mt-2 border border-[var(--border-subtle)]">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-indigo-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(8, item.progress)}%` }}
                />
              </div>
            </div>

            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-105 transition-all shrink-0 shadow-xs">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
