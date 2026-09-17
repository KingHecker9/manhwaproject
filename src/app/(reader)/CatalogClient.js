'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  TrendingUp,
  Flame,
  Star,
  BookOpen,
  Filter,
  Search,
  Bookmark,
  Calendar,
  Layers,
  ArrowRight,
  Clock,
} from 'lucide-react';
import HeroCarousel from '../../components/HeroCarousel';
import ContinueReading from '../../components/ContinueReading';
import DailySchedule from '../../components/DailySchedule';
import ManhwaCard from '../../components/ManhwaCard';
import { GENRE_LIST } from '../../lib/series-metadata';

export default function CatalogClient({ seriesList = [], userHistory = [] }) {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'favorites'
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'rating', 'title', 'chapters'
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Load bookmarks from localStorage
  useEffect(() => {
    const loadBookmarks = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('bookmarked_series') || '[]');
        setBookmarkedIds(saved);
      } catch (e) {}
    };
    loadBookmarks();
    window.addEventListener('bookmarks_updated', loadBookmarks);
    return () => window.removeEventListener('bookmarks_updated', loadBookmarks);
  }, []);

  // Listen to hash changes (e.g. #favorites, #schedule, #latest)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash === '#favorites') setActiveTab('favorites');
    }
  }, []);

  // Featured list for Hero Carousel
  const featured = useMemo(() => {
    return seriesList.filter((s) => s.featured).length > 0
      ? seriesList.filter((s) => s.featured)
      : seriesList.slice(0, 3);
  }, [seriesList]);

  // Ranked for Popular / Recommended
  const popularSeries = useMemo(() => {
    return [...seriesList].sort((a, b) => (b.rating || 0) - (a.rating || 0) || b.chapterCount - a.chapterCount);
  }, [seriesList]);

  // Latest Updates
  const latestUpdates = useMemo(() => {
    return [...seriesList].sort((a, b) => {
      const timeA = a.latestChapter?.created_at ? new Date(a.latestChapter.created_at).getTime() : 0;
      const timeB = b.latestChapter?.created_at ? new Date(b.latestChapter.created_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [seriesList]);

  // Recently Added
  const recentlyAdded = useMemo(() => {
    return [...seriesList].sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    });
  }, [seriesList]);

  // Filtered & Sorted All Series
  const filteredCatalog = useMemo(() => {
    return seriesList
      .filter((item) => {
        // Tab filter
        if (activeTab === 'favorites') {
          const isBookmarked = bookmarkedIds.includes(item.slug) || bookmarkedIds.includes(item.id);
          if (!isBookmarked) return false;
        }

        // Genre filter
        if (selectedGenre !== 'All') {
          const matchGenre = item.genres?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
          if (!matchGenre) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchAuthor = item.author?.toLowerCase().includes(q);
          const matchAlt = item.alternativeTitle?.toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchAlt) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'chapters') return b.chapterCount - a.chapterCount;
        // default: popular
        return (b.rating || 0) * (b.chapterCount || 1) - (a.rating || 0) * (a.chapterCount || 1);
      });
  }, [seriesList, activeTab, bookmarkedIds, selectedGenre, searchQuery, sortBy]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
      {/* 1. Dynamic Hero Carousel (Featured Spotlight) */}
      <HeroCarousel featuredList={featured} />

      {/* 2. Continue Reading (User's in-progress reads) */}
      <ContinueReading seriesList={seriesList} initialHistory={userHistory} />

      {/* 3. Popular & Trending Series (Ranked Grid) */}
      <section className="my-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span>Trending Now</span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              Popular & Recommended
            </h2>
          </div>
          <Link
            href="#catalog"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {popularSeries.slice(0, 5).map((series, idx) => (
            <ManhwaCard key={series.id} series={series} rank={idx + 1} />
          ))}
        </div>
      </section>

      {/* 4. Latest Updates Section */}
      <section id="latest" className="my-14 scroll-mt-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Fresh Chapters</span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              Latest Updates
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {latestUpdates.slice(0, 6).map((series) => {
            const latestCh = series.latestChapter || { chapter_number: series.chapterCount || 1, title: '' };
            return (
              <Link
                key={series.id}
                href={`/reader/${series.slug}/${latestCh.chapter_number}`}
                className="flex items-center gap-4 p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all group"
              >
                <div className="relative w-16 h-22 rounded-xl overflow-hidden bg-[var(--bg-surface)] shrink-0 border border-[var(--border-subtle)]">
                  {series.cover ? (
                    <Image
                      src={series.cover}
                      alt={series.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : null}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                      Ch. {latestCh.chapter_number}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Updated</span>
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {series.title}
                  </h3>

                  {latestCh.title && (
                    <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                      {latestCh.title}
                    </p>
                  )}

                  <p className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
                    {series.author} • {series.releaseDay}s
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Daily Schedule Calendar Grid (Monday - Sunday tabs) */}
      <DailySchedule seriesList={seriesList} />

      {/* 6. All Series / Browsing Experience with Filters */}
      <section id="catalog" className="my-14 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Layers className="w-4 h-4" />
              <span>Explore The Library</span>
            </div>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
              All Titles & Genres
            </h2>
          </div>

          {/* Tab Switcher: All vs Bookmarks */}
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              type="button"
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all'
                  ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              All Series ({seriesList.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              type="button"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'favorites'
                  ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Bookmarks ({bookmarkedIds.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-5">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, author..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="chapters">Most Chapters</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Genre Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {GENRE_LIST.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Catalog Grid */}
        {filteredCatalog.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]/40 p-8">
            <BookOpen className="w-12 h-12 mx-auto text-indigo-400/40 mb-3" strokeWidth={1.5} />
            <h3 className="text-base font-semibold text-[var(--text-main)]">
              {activeTab === 'favorites'
                ? 'No bookmarked series yet'
                : 'No manhwa matching your criteria'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1">
              {activeTab === 'favorites'
                ? 'Click the bookmark ribbon on any manhwa card to save it here for quick access.'
                : 'Try adjusting your search query or selecting a different genre category.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filteredCatalog.map((series) => (
              <ManhwaCard key={series.id} series={series} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
