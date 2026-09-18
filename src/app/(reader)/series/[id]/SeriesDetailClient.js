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
  Coffee,
  X,
  Filter,
} from 'lucide-react';
import SupportCreatorModal from '@/components/SupportCreatorModal';

export default function SeriesDetailClient({ series, chapters = [], lastReadChapter = null }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = 1 to N, 'desc' = N to 1
  const [readFilter, setReadFilter] = useState('all'); // 'all' | 'unread' | 'read'
  const [rangeFilter, setRangeFilter] = useState('all');
  const [readChapters, setReadChapters] = useState({});
  const [supportModalOpen, setSupportModalOpen] = useState(false);

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

  // Compute read and unread counts
  const readCount = useMemo(() => {
    return chapters.filter((ch) => !!readChapters[ch.chapter_number]).length;
  }, [chapters, readChapters]);
  const unreadCount = chapters.length - readCount;

  // Compute chapter ranges if series has more than 20 chapters
  const chapterRanges = useMemo(() => {
    if (chapters.length <= 20) return [];
    const ranges = [];
    for (let i = 1; i <= chapters.length; i += 20) {
      const end = Math.min(i + 19, chapters.length);
      ranges.push({ label: `Ch. ${i} - ${end}`, min: i, max: end });
    }
    return ranges;
  }, [chapters.length]);

  // Sort and filter chapters
  const filteredChapters = useMemo(() => {
    let list = [...chapters];

    // 1. Text search
    if (chapterSearch.trim()) {
      const q = chapterSearch.toLowerCase();
      list = list.filter(
        (ch) =>
          String(ch.chapter_number).includes(q) ||
          (ch.title && ch.title.toLowerCase().includes(q))
      );
    }

    // 2. Read status filter
    if (readFilter === 'unread') {
      list = list.filter((ch) => !readChapters[ch.chapter_number]);
    } else if (readFilter === 'read') {
      list = list.filter((ch) => !!readChapters[ch.chapter_number]);
    }

    // 3. Range bracket filter
    if (rangeFilter !== 'all') {
      const selected = chapterRanges.find((r) => r.label === rangeFilter);
      if (selected) {
        list = list.filter((ch) => {
          const num = Number(ch.chapter_number);
          return num >= selected.min && num <= selected.max;
        });
      }
    }

    // 4. Sort order
    list.sort((a, b) => {
      const numA = Number(a.chapter_number);
      const numB = Number(b.chapter_number);
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    });

    return list;
  }, [chapters, chapterSearch, readFilter, rangeFilter, sortOrder, readChapters, chapterRanges]);

  // Determine starting chapter target (first chapter or continue reading)
  const sortedAsc = useMemo(() => {
    return [...chapters].sort((a, b) => Number(a.chapter_number) - Number(b.chapter_number));
  }, [chapters]);

  const firstChapter = sortedAsc[0] || null;
  const continueTarget = lastReadChapter || (firstChapter ? firstChapter.chapter_number : 1);

  return (
    <main className="min-h-screen pb-28 sm:pb-24">
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
          <span className="text-[var(--text-main)] font-medium truncate max-w-[160px] sm:max-w-xs">
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
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center sm:items-start">
            {/* Left: Cover Art Card */}
            <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center sm:items-start">
              <div className="relative w-44 sm:w-60 lg:w-64 aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 bg-neutral-900">
                {series.cover ? (
                  <Image
                    src={series.cover}
                    alt={series.title}
                    fill
                    priority
                    sizes="(max-width: 640px) 180px, 280px"
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
            <div className="md:col-span-8 lg:col-span-9 space-y-4 text-center sm:text-left">
              {/* Title & Alternative Title */}
              <div>
                <h1 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  {series.title}
                </h1>
                {series.alternativeTitle && (
                  <p className="text-xs sm:text-base text-neutral-300 font-medium mt-1">
                    {series.alternativeTitle}
                  </p>
                )}
              </div>

              {/* Creator & Release Day Row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-neutral-300">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-400" />
                  <span>Author: <strong className="text-white">{series.author}</strong></span>
                </span>
                <span className="text-neutral-600 hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>Schedule: <strong className="text-white">{series.releaseDay}</strong></span>
                </span>
              </div>

              {/* Real Stats Bar */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                {series.rating && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-amber-300 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{series.rating} / 5.0</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{chapters.length} Chapters</span>
                </div>
                {series.viewsCount && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-medium">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{series.viewsCount} Reads</span>
                  </div>
                )}
              </div>

              {/* Genres Tags */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                {(series.genres || []).map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-xl text-xs font-medium bg-white/10 backdrop-blur-md text-neutral-200 border border-white/10"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Synopsis / Description */}
              <div className="space-y-1 pt-1 max-w-3xl text-left">
                <p
                  className={`text-xs sm:text-sm text-neutral-300 leading-relaxed ${
                    !showFullSynopsis && 'line-clamp-3'
                  }`}
                >
                  {series.synopsis}
                </p>
                {series.synopsis?.length > 180 && (
                  <button
                    onClick={() => setShowFullSynopsis((v) => !v)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {showFullSynopsis ? 'Show less' : 'Read more...'}
                  </button>
                )}
              </div>

              {/* Desktop Call to Action Buttons */}
              <div className="hidden sm:flex flex-wrap items-center gap-3 pt-3">
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

                {/* Tip Creator (Buy Me a Coffee) */}
                <button
                  onClick={() => setSupportModalOpen(true)}
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-sm font-bold shadow-lg shadow-amber-400/25 hover:scale-102 active:scale-95 transition-all cursor-pointer"
                >
                  <Coffee className="w-4 h-4 fill-neutral-950" />
                  <span>Tip Creator</span>
                </button>

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
                      <span className="text-xs">Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter List Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[32px] p-5 sm:p-8 shadow-xs">
          {/* Chapter Controls Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                  Chapters
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                  {filteredChapters.length} of {chapters.length}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                All released chapters in high resolution
              </p>
            </div>

            {/* Top Filter Actions: Search & Sort */}
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
              {/* Chapter Search Filter with Clear Button */}
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  placeholder="Search chapter..."
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl pl-10 pr-8 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {chapterSearch && (
                  <button
                    onClick={() => setChapterSearch('')}
                    type="button"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Asc / Desc Toggle */}
              <button
                onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                type="button"
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] active:scale-95 transition-all shrink-0 cursor-pointer"
              >
                <ArrowDownUp className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">{sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}</span>
                <span className="sm:hidden">{sortOrder === 'asc' ? '1-N' : 'N-1'}</span>
              </button>
            </div>
          </div>

          {/* Secondary Filter Bar: Read Status & Range Brackets */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 pb-2">
            {/* Read Status Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setReadFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  readFilter === 'all'
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                All ({chapters.length})
              </button>
              <button
                type="button"
                onClick={() => setReadFilter('unread')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  readFilter === 'unread'
                    ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                type="button"
                onClick={() => setReadFilter('read')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  readFilter === 'read'
                    ? 'bg-[var(--bg-card)] text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Completed ({readCount})
              </button>
            </div>

            {/* Chapter Range Pills (if > 20 chapters) */}
            {chapterRanges.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                <button
                  type="button"
                  onClick={() => setRangeFilter('all')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border cursor-pointer ${
                    rangeFilter === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-main)]'
                  }`}
                >
                  All Chs
                </button>
                {chapterRanges.map((range) => (
                  <button
                    key={range.label}
                    type="button"
                    onClick={() => setRangeFilter(range.label)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all border whitespace-nowrap cursor-pointer ${
                      rangeFilter === range.label
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chapters Grid / List */}
          {filteredChapters.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <BookOpen className="w-12 h-12 mx-auto text-[var(--text-muted)] opacity-40" />
              <h3 className="text-base font-bold text-[var(--text-main)]">No chapters found</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                No chapters match your active search or filter selection.
              </p>
              <button
                type="button"
                onClick={() => {
                  setChapterSearch('');
                  setReadFilter('all');
                  setRangeFilter('all');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Reset Chapter Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-6">
              {filteredChapters.map((ch) => {
                const isRead = !!readChapters[ch.chapter_number];
                return (
                  <Link
                    key={ch.id}
                    href={`/reader/${series.slug}/${ch.chapter_number}`}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 group ${
                      isRead
                        ? 'bg-[var(--bg-surface)]/60 border-[var(--border-subtle)] opacity-85'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-indigo-500 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isRead
                            ? 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
                            : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white'
                        }`}
                      >
                        {ch.chapter_number}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                            Chapter {ch.chapter_number}
                          </p>
                          {isRead && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        {ch.title && (
                          <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                            {ch.title}
                          </p>
                        )}
                        <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {ch.created_at
                              ? new Date(ch.created_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'Recent'}
                          </span>
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sticky Floating CTA Bar for One-Handed Reading */}
      {firstChapter && (
        <div className="sm:hidden fixed bottom-14 inset-x-0 z-30 p-3 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/95 to-transparent pointer-events-none flex justify-center pb-safe">
          <div className="pointer-events-auto flex items-center gap-2 w-full max-w-sm">
            <Link
              href={`/reader/${series.slug}/${continueTarget}`}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-indigo-600 active:bg-indigo-700 text-white font-bold text-xs shadow-xl shadow-indigo-600/35 transition-all"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>
                {lastReadChapter ? `Resume Ch. ${lastReadChapter}` : `Start Ch. ${firstChapter.chapter_number}`}
              </span>
            </Link>

            <button
              onClick={toggleBookmark}
              type="button"
              className={`p-3.5 rounded-2xl border backdrop-blur-md transition-colors ${
                isBookmarked
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => setSupportModalOpen(true)}
              type="button"
              aria-label="Tip Creator"
              className="p-3.5 rounded-2xl bg-amber-400 text-neutral-950 shadow-lg shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
            >
              <Coffee className="w-4 h-4 fill-neutral-950" />
            </button>
          </div>
        </div>
      )}

      {/* Support Creator Modal */}
      <SupportCreatorModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        seriesTitle={series.title}
        creatorName={series.author}
      />
    </main>
  );
}
