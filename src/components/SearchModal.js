'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, X, BookOpen, Star, Sparkles, ArrowRight } from 'lucide-react';

export default function SearchModal({ isOpen, onClose, seriesList = [] }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = seriesList.filter((s) => {
    const q = query.toLowerCase();
    return (
      s.title?.toLowerCase().includes(q) ||
      s.alternativeTitle?.toLowerCase().includes(q) ||
      s.author?.toLowerCase().includes(q) ||
      s.genres?.some((g) => g.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)]/95 backdrop-blur-2xl border border-[var(--border-subtle)] dark:border-white/10 rounded-[32px] shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-subtle)]">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" strokeWidth={2} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search series by title, genre, author..."
            className="w-full bg-transparent text-[var(--text-main)] placeholder:text-[var(--text-muted)] text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs font-mono text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-md hover:bg-[var(--bg-surface)] transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[var(--text-muted)] text-sm">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-indigo-400" strokeWidth={1.5} />
              <p>No manhwa found matching &quot;{query}&quot;</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Try searching for &quot;Action&quot;, &quot;Fantasy&quot;, or &quot;Dandadan&quot;
              </p>
            </div>
          ) : (
            filtered.map((series) => (
              <Link
                key={series.id}
                href={`/series/${series.slug || series.id}`}
                onClick={onClose}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-subtle)] transition-all group"
              >
                <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-[var(--bg-surface)] shrink-0 border border-[var(--border-subtle)]">
                  {series.cover ? (
                    <Image
                      src={series.cover}
                      alt={series.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--text-muted)]">
                      No cover
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {series.title}
                    </h4>
                    {series.rating && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-amber-500 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {series.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                    {series.author} • {series.chapterCount} chapters
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {(series.genres || []).slice(0, 3).map((g) => (
                      <span
                        key={g}
                        className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
