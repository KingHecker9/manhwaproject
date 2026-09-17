'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Bookmark,
  Star,
  Calendar,
  User,
  Share2,
  Check,
  Search,
  ArrowDownUp,
  Clock,
  Sparkles,
  ChevronRight,
  Eye,
  Play,
  CheckCircle2,
} from 'lucide-react';

export default function SeriesDetailClient({ series, chapters = [], lastReadChapter = null }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = 1 to N, 'desc' = N to 1
  const [readChapters, setReadChapters] = useState({});

  // Sync bookmark state from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_series') || '[]');
      setIsBookmarked(saved.includes(series.slug) || saved.includes(series.id));

      // Also read local reading history to mark read chapters
      const localHistory = JSON.parse(localStorage.getItem('reading_history') || '[]');
      const map = {};
      localHistory
        .filter((item) => item.series_slug === series.slug || item.series_id === series.id)
        .forEach((item) => {
          map[item.chapter_number] = true;
        });
      if (lastReadChapter) map[lastReadChapter] = true;
      setReadChapters(map);
    } catch (e) {}
  }, [series.slug, series.id, lastReadChapter]);

  const toggleBookmark = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_series') || '[]');
      const id = series.slug || series.id;
      let next;
      if (saved.includes(id)) {
        next = saved.filter((item) => item !== id);
        setIsBookmarked(false);
      } else {
        next = [...saved, id];
        setIsBookmarked(true);
      }
      localStorage.setItem('bookmarked_series', JSON.stringify(next));
      window.dispatchEvent(new Event('bookmarks_updated'));
    } catch (e) {}
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Sort and filter chapters
  const filteredChapters = useMemo(() => {
    let list = [...chapters];
    if (chapterSearch.trim()) {
      const q = chapterSearch.toLowerCase();
      list = list.filter(
        (ch) =>
          String(ch.chapter_number).includes(q) ||
          (ch.title && ch.title.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => {
      const numA = Number(a.chapter_number);
      const numB = Number(b.chapter_number);
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });
    return list;
  }, [chapters, chapterSearch, sortOrder]);

  // Determine starting chapter target (first chapter or continue reading)
  const firstChapter = chapters.length > 0
    ? [...chapters].sort((a, b) => Number(a.chapter_number) - Number(b.chapter_number))[0]
    : null;
  const continueTarget = lastReadChapter || (firstChapter ? firstChapter.chapter_number : 1);

  return (
    <main className="min-h-screen pb-24">
      {/* Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/#catalog" className="hover:text-indigo-600 transition-colors">
            Series
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[var(--text-main)] font-medium truncate max-w-xs">
            {series.title}
          </span>
        </nav>
      </div>

      {/* Hero Header Backdrop */}
      <div className="relative w-full overflow-hidden bg-neutral-950 text-white border-b border-[var(--border-subtle)]">
        {/* Background Image with blur */}
        <div className="absolute inset-0 z-0 opacity-25 filter blur-sm scale-105">
          {series.cover && (
            <Image
              src={series.cover}
              alt={series.title}
              fill
              priority
              className="object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent" />
        </div>

        {/* Header Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Cover Art Card */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center sm:items-start">
              <div className="relative w-52 sm:w-60 lg:w-64 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 bg-neutral-900">
                {series.cover ? (
                  <Image
                    src={series.cover}
                    alt={series.title}
                    fill
                    priority
                    sizes="280px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500">
                    <BookOpen className="w-12 h-12 mb-2 opacity-50" />
                    <span>No Cover Available</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10">
                    {series.status || 'Ongoing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Series Details & Metadata */}
            <div className="md:col-span-8 lg:col-span-9 space-y-5">
              {/* Title & Alternative Title */}
              <div>
                <h1 className="font-serif-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  {series.title}
                </h1>
                {series.alternativeTitle && (
                  <p className="text-sm sm:text-base text-neutral-300 font-medium mt-1.5">
                    {series.alternativeTitle}
                  </p>
                )}
              </div>

              {/* Creator & Release Day Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Author: <strong className="text-white">{series.author}</strong></span>
                </span>
                <span className="text-neutral-600">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Schedule: Releases every <strong className="text-white">{series.releaseDay}</strong></span>
                </span>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {series.rating && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-amber-300 text-xs font-semibold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{series.rating} / 5.0</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span>{chapters.length} Chapters</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>{series.viewsCount || '500K+'} Reads</span>
                </div>
              </div>

              {/* Genres Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {(series.genres || []).map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-white/10 backdrop-blur-md text-neutral-200 border border-white/10 hover:border-indigo-400 transition-colors"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Synopsis / Description */}
              <div className="space-y-1 pt-1 max-w-3xl">
                <p
                  className={`text-sm text-neutral-300 leading-relaxed ${
                    !showFullSynopsis && 'line-clamp-3'
                  }`}
                >
                  {series.synopsis}
                </p>
                {series.synopsis?.length > 200 && (
                  <button
                    onClick={() => setShowFullSynopsis((v) => !v)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {showFullSynopsis ? 'Show less' : 'Read more...'}
                  </button>
                )}
              </div>

              {/* Primary Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                {firstChapter ? (
                  <Link
                    href={`/reader/${series.slug}/${continueTarget}`}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-102 transition-all duration-200"
                  >
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>
                      {lastReadChapter ? `Continue Ch. ${lastReadChapter}` : `Start Reading Ch. ${firstChapter.chapter_number}`}
                    </span>
                  </Link>
                ) : (
                  <button
                    disabled
                    className="px-6 py-3 rounded-2xl bg-neutral-800 text-neutral-500 text-sm font-semibold cursor-not-allowed"
                  >
                    No chapters yet
                  </button>
                )}

                {/* Bookmark Toggle */}
                <button
                  onClick={toggleBookmark}
                  type="button"
                  className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-sm font-semibold backdrop-blur-md transition-all duration-200 ${
                    isBookmarked
                      ? 'bg-white/20 border-indigo-400 text-indigo-300 shadow-md shadow-indigo-500/20'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} strokeWidth={2} />
                  <span>{isBookmarked ? 'Bookmarked' : 'Add to Library'}</span>
                </button>

                {/* Share Link */}
                <button
                  onClick={handleShare}
                  type="button"
                  aria-label="Share manhwa link"
                  className="inline-flex items-center gap-2 px-4 py-3.5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-md transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-xs">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span className="text-xs hidden sm:inline">Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-xs">
          {/* Chapter Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="font-serif-display text-2xl font-bold text-[var(--text-main)]">
                Chapters ({chapters.length})
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                All released chapters in high resolution
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Chapter Search Filter */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  placeholder="Search chapter..."
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Sort Asc / Desc Toggle */}
              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors shrink-0"
              >
                <ArrowDownUp className="w-3.5 h-3.5 text-indigo-500" />
                <span>{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
              </button>
            </div>
          </div>

          {/* Chapters Grid / List */}
          <div className="mt-6">
            {filteredChapters.length === 0 ? (
              <div className="py-16 text-center text-[var(--text-muted)]">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30 text-indigo-400" />
                <p className="text-sm font-semibold text-[var(--text-main)]">
                  {chapterSearch ? 'No chapters match your search' : 'No chapters uploaded yet'}
                </p>
                <p className="text-xs mt-1">Check back soon for new releases</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredChapters.map((chapter) => {
                  const isRead = !!readChapters[chapter.chapter_number];
                  return (
                    <Link
                      key={chapter.id}
                      href={`/reader/${series.slug}/${chapter.chapter_number}`}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-150 group ${
                        isRead
                          ? 'bg-[var(--bg-surface)]/50 border-[var(--border-subtle)]/70 text-[var(--text-muted)] hover:border-indigo-500/50'
                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-indigo-500 text-[var(--text-main)] hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isRead
                              ? 'bg-[var(--bg-card)] text-[var(--text-muted)]'
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'
                          }`}
                        >
                          {chapter.chapter_number}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            Chapter {chapter.chapter_number}
                            {chapter.title ? ` — ${chapter.title}` : ''}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>
                              {chapter.created_at
                                ? new Date(chapter.created_at).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : 'Available'}
                            </span>
                            {isRead && (
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium ml-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:text-indigo-600 group-hover:translate-x-1 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
