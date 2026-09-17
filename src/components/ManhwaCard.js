'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Bookmark, BookOpen, Clock } from 'lucide-react';

export default function ManhwaCard({ series, rank, progress, showLatest = true }) {
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_series') || '[]');
      setBookmarked(saved.includes(series.slug || series.id));
    } catch (e) {}
  }, [series.slug, series.id]);

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_series') || '[]');
      const id = series.slug || series.id;
      let next;
      if (saved.includes(id)) {
        next = saved.filter((item) => item !== id);
        setBookmarked(false);
      } else {
        next = [...saved, id];
        setBookmarked(true);
      }
      localStorage.setItem('bookmarked_series', JSON.stringify(next));
      window.dispatchEvent(new Event('bookmarks_updated'));
    } catch (e) {}
  };

  const latestChapterNum = series.latestChapter?.chapter_number || series.chapterCount;

  return (
    <div className="group relative flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300">
      {/* Cover Image Container */}
      <Link href={`/series/${series.slug || series.id}`} className="relative block aspect-[3/4] w-full overflow-hidden bg-[var(--bg-surface)]">
        {series.cover ? (
          <Image
            src={series.cover}
            alt={series.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-[var(--text-muted)] bg-[var(--bg-surface)]">
            <BookOpen className="w-8 h-8 opacity-40 mb-1" strokeWidth={1.5} />
            <span className="text-xs">No Cover</span>
          </div>
        )}

        {/* Gradient Overlay on Cover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Badges: Rank or Status */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          {rank ? (
            <span className="w-7 h-7 rounded-lg bg-black/70 backdrop-blur-md border border-white/20 text-white font-bold text-xs flex items-center justify-center shadow-md">
              #{rank}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-black/60 backdrop-blur-md text-white border border-white/10">
              {series.status || 'Ongoing'}
            </span>
          )}

          {/* Bookmark Button */}
          <button
            onClick={toggleBookmark}
            type="button"
            aria-label={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all duration-200 ${
              bookmarked
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70 border border-white/10'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} strokeWidth={2} />
          </button>
        </div>

        {/* Bottom Cover Info: Rating & Latest Chapter */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-white text-[11px] font-medium z-10">
          {series.rating && (
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{series.rating}</span>
            </span>
          )}
          {showLatest && (
            <span className="bg-indigo-600/90 backdrop-blur-md px-2 py-0.5 rounded-md text-white font-semibold">
              Ch. {latestChapterNum || 1}
            </span>
          )}
        </div>

        {/* Progress Bar (if reading history progress is passed) */}
        {progress != null && progress > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/50 z-20">
            <div
              className="h-full bg-indigo-500 rounded-r"
              style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
            />
          </div>
        )}
      </Link>

      {/* Card Content Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between">
        <div>
          {/* Genres Chips */}
          <div className="flex items-center gap-1.5 overflow-hidden mb-1.5">
            {(series.genres || ['Action']).slice(0, 2).map((genre) => (
              <span
                key={genre}
                className="px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[var(--bg-surface)] text-[var(--text-secondary)] truncate"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Series Title */}
          <Link href={`/series/${series.slug || series.id}`} className="block">
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 leading-snug">
              {series.title}
            </h3>
          </Link>
        </div>

        {/* Card Footer: Chapters count & Release day */}
        <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1 truncate">
            <BookOpen className="w-3 h-3 text-[var(--text-muted)]" />
            <span>{series.chapterCount || 0} chs</span>
          </span>
          {series.releaseDay && (
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
              <Clock className="w-3 h-3" />
              <span>{series.releaseDay.slice(0, 3)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
