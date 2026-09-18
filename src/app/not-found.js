'use client';

import Link from 'next/link';
import { BookOpen, Compass, ArrowLeft, Layers, Calendar, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      {/* Background ambient glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-tr from-violet-600/15 via-fuchsia-600/10 to-transparent blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-lg w-full bg-[var(--bg-card)]/90 dark:bg-[#121520]/90 backdrop-blur-2xl border border-[var(--border-subtle)] dark:border-white/10 rounded-[36px] sm:rounded-[44px] p-8 sm:p-10 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Comic 404 badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs font-mono font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chapter Not Found</span>
        </div>

        {/* Large 404 Title */}
        <div>
          <h1 className="text-6xl sm:text-7xl font-black tracking-tight font-serif-display text-transparent bg-clip-text bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400">
            404
          </h1>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mt-2">
            Lost in the Dungeon Rift
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            The page, chapter, or manhwa series you are looking for has either been moved, sealed away, or has not awakened yet.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-violet-600/25 active:scale-95 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            href="/#catalog"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-main)] font-bold text-xs active:scale-95 transition-all"
          >
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Browse Library</span>
          </Link>
        </div>

        {/* Quick Links Footer */}
        <div className="pt-6 border-t border-[var(--border-subtle)] flex items-center justify-center gap-6 text-xs text-[var(--text-muted)]">
          <Link href="/#schedule" className="hover:text-indigo-500 transition-colors flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly Schedule</span>
          </Link>
          <span>•</span>
          <Link href="/#latest" className="hover:text-indigo-500 transition-colors flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fresh Drops</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
