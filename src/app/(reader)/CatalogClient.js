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
  Trophy,
  Crown,
  LayoutGrid,
  List,
  X,
  Eye,
  Play,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import HeroCarousel from '../../components/HeroCarousel';
import ContinueReading from '../../components/ContinueReading';
import DailySchedule from '../../components/DailySchedule';
import ManhwaCard from '../../components/ManhwaCard';
import SupportCreatorModal, {
  SupportCreatorBanner,
} from '../../components/SupportCreatorModal';
import { GENRE_LIST } from '../../lib/series-metadata';

export default function CatalogClient({ seriesList = [], userHistory = [] }) {
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'favorites'
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'title', 'chapters', 'rating'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [rankingTab, setRankingTab] = useState('views'); // 'views', 'chapters', 'rating'
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

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

  // Listen to hash changes (e.g. #favorites, #schedule, #latest, #rankings)
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
      : seriesList.slice(0, 4);
  }, [seriesList]);

  // Ranked for Popular / Recommended using real reads count
  const popularSeries = useMemo(() => {
    return [...seriesList].sort(
      (a, b) => (b.rawViewsCount || 0) - (a.rawViewsCount || 0) || b.chapterCount - a.chapterCount
    );
  }, [seriesList]);

  // Top 10 Leaderboard series based on selected ranking tab
  const rankedLeaderboard = useMemo(() => {
    return [...seriesList]
      .sort((a, b) => {
        if (rankingTab === 'chapters') return b.chapterCount - a.chapterCount;
        if (rankingTab === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        // default: views
        return (b.rawViewsCount || 0) - (a.rawViewsCount || 0) || b.chapterCount - a.chapterCount;
      })
      .slice(0, 10);
  }, [seriesList, rankingTab]);

  // Latest Updates
  const latestUpdates = useMemo(() => {
    return [...seriesList].sort((a, b) => {
      const timeA = a.latestChapterCreatedAt ? new Date(a.latestChapterCreatedAt).getTime() : 0;
      const timeB = b.latestChapterCreatedAt ? new Date(b.latestChapterCreatedAt).getTime() : 0;
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
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'chapters') return b.chapterCount - a.chapterCount;
        if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        // default: popular (real view count)
        return (b.rawViewsCount || 0) - (a.rawViewsCount || 0) || b.chapterCount - a.chapterCount;
      });
  }, [seriesList, activeTab, bookmarkedIds, selectedGenre, searchQuery, sortBy]);

  return (
    <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24">
      {/* 1. Dynamic Hero Carousel (Featured Spotlight) */}
      <HeroCarousel featuredList={featured} />

      {/* 2. Continue Reading Shelf (Real database or local reads) */}
      <ContinueReading seriesList={seriesList} initialHistory={userHistory} />

      {/* 3. Top Rankings & Leaderboard Podium (New Feature) */}
      <section id="rankings" className="my-10 sm:my-14 scroll-mt-20">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Platform Leaderboard</span>
            </div>
            <h2 className="font-serif-display text-xl sm:text-3xl font-bold text-[var(--text-main)]">
              Top 10 Rankings
            </h2>
          </div>

          {/* Ranking Mode Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setRankingTab('views')}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                rankingTab === 'views'
                  ? 'bg-[var(--bg-card)] text-amber-600 dark:text-amber-400 shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Most Read
            </button>
            <button
              onClick={() => setRankingTab('chapters')}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                rankingTab === 'chapters'
                  ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Most Chapters
            </button>
            <button
              onClick={() => setRankingTab('rating')}
              type="button"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                rankingTab === 'rating'
                  ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              Highest Rated
            </button>
          </div>
        </div>

        {/* Podium Top 3 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {rankedLeaderboard.slice(0, 3).map((item, idx) => {
            const rank = idx + 1;
            return (
              <Link
                key={item.id}
                href={`/series/${item.slug || item.id}`}
                className={`relative p-4 sm:p-5 rounded-3xl border transition-all duration-300 hover-lift group overflow-hidden flex items-center gap-4 ${
                  rank === 1
                    ? 'bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-amber-500/5 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : rank === 2
                    ? 'bg-gradient-to-br from-slate-400/10 via-[var(--bg-card)] to-transparent border-slate-400/30'
                    : 'bg-gradient-to-br from-amber-800/10 via-[var(--bg-card)] to-transparent border-amber-800/30'
                }`}
              >
                {/* Podium Rank Badge */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                    rank === 1
                      ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-neutral-950 shadow-amber-500/30'
                      : rank === 2
                      ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-neutral-950'
                      : 'bg-gradient-to-br from-amber-700 to-amber-900 text-white'
                  }`}
                >
                  {rank === 1 ? <Crown className="w-5 h-5 fill-current" /> : `#${rank}`}
                </div>

                {/* Cover Thumbnail */}
                <div className="relative w-16 h-22 rounded-2xl overflow-hidden bg-[var(--bg-surface)] shrink-0 border border-[var(--border-subtle)]">
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      sizes="70px"
                      className="object-cover group-hover:scale-108 transition-transform duration-300 ease-out"
                    />
                  ) : null}
                </div>

                {/* Series Details */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
                    {rank === 1 ? '🥇 Rank #1 Champion' : rank === 2 ? '🥈 Rank #2 Silver' : '🥉 Rank #3 Bronze'}
                  </span>
                  <h3 className="font-bold text-sm sm:text-base text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mt-1">
                    <span>{item.viewsCount} reads</span>
                    <span>•</span>
                    <span>{item.chapterCount} chs</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Ranks 4 to 10 Quick List */}
        {rankedLeaderboard.length > 3 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rankedLeaderboard.slice(3, 9).map((item, idx) => {
              const rank = idx + 4;
              return (
                <Link
                  key={item.id}
                  href={`/series/${item.slug || item.id}`}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40 hover-lift transition-all group"
                >
                  <span className="w-7 h-7 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] font-bold text-xs flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
                    #{rank}
                  </span>
                  <div className="relative w-11 h-14 rounded-xl overflow-hidden bg-[var(--bg-surface)] shrink-0">
                    {item.cover && (
                      <Image
                        src={item.cover}
                        alt={item.title}
                        fill
                        sizes="45px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)] truncate">
                      {item.author} • {item.chapterCount} chs
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Popular & Recommended (Ranked Visual Cards Grid) */}
      <section className="my-10 sm:my-14">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-500 mb-1">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              <span>Trending Now</span>
            </div>
            <h2 className="font-serif-display text-xl sm:text-3xl font-bold text-[var(--text-main)]">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
          {popularSeries.slice(0, 5).map((series, idx) => (
            <ManhwaCard key={series.id} series={series} rank={idx + 1} />
          ))}
        </div>
      </section>

      {/* 5. Support Creators / Buy Me a Coffee Showcase Banner */}
      <SupportCreatorBanner
        onOpenModal={() => setIsSupportModalOpen(true)}
        creatorName="Independent Creators"
      />

      {/* 6. Latest Updates Section */}
      <section id="latest" className="my-10 sm:my-14 scroll-mt-20">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fresh Releases</span>
            </div>
            <h2 className="font-serif-display text-xl sm:text-3xl font-bold text-[var(--text-main)]">
              Latest Chapter Updates
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {latestUpdates.slice(0, 6).map((series) => {
            const latestCh = series.latestChapter || {
              chapter_number: series.chapterCount || 1,
            };

            return (
              <Link
                key={series.id}
                href={`/reader/${series.slug}/${latestCh.chapter_number}`}
                className="flex items-center gap-3.5 p-3.5 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40 shadow-xs hover-lift transition-all group"
              >
                <div className="relative w-16 h-22 rounded-2xl overflow-hidden bg-[var(--bg-surface)] shrink-0 border border-[var(--border-subtle)]">
                  {series.cover ? (
                    <Image
                      src={series.cover}
                      alt={series.title}
                      fill
                      sizes="70px"
                      className="object-cover group-hover:scale-108 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)]">
                      📖
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
                      Ch. {latestCh.chapter_number}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      NEW
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {series.title}
                  </h3>

                  <p className="text-[11px] text-[var(--text-muted)] mt-1 truncate">
                    {series.author} • {series.chapterCount} chapters
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 7. Daily Schedule Calendar Grid (Monday - Sunday tabs) */}
      <DailySchedule seriesList={seriesList} />

      {/* 8. All Series / Browsing Experience with Filters & Grid/List Switcher */}
      <section id="catalog" className="my-10 sm:my-14 scroll-mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Explore The Library</span>
            </div>
            <h2 className="font-serif-display text-xl sm:text-3xl font-bold text-[var(--text-main)]">
              All Titles & Genres
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* View Mode Toggle: Grid vs Compact List */}
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
              <button
                onClick={() => setViewMode('grid')}
                type="button"
                aria-label="Grid View"
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                type="button"
                aria-label="List View"
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Switcher: All vs Bookmarks */}
            <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
              <button
                onClick={() => setActiveTab('all')}
                type="button"
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[var(--bg-card)] text-[var(--text-main)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                All ({seriesList.length})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                type="button"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'favorites'
                    ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                <Bookmark className="w-3 h-3" />
                <span>Saved ({bookmarkedIds.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls: Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between mb-4">
          {/* Search Box with clear button */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author..."
              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl pl-10 pr-9 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] rounded-2xl px-3.5 py-2 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
            >
              <option value="popular">Most Popular (Real Reads)</option>
              <option value="chapters">Most Chapters</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Genre Filter Chips with touch horizontal swipe */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {GENRE_LIST.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                type="button"
                className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-102'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]'
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>

        {/* Catalog Grid or List View */}
        {filteredCatalog.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)]/40 p-6">
            <BookOpen className="w-10 h-10 mx-auto text-indigo-400/40 mb-2" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-[var(--text-main)]">
              {activeTab === 'favorites'
                ? 'No bookmarked series yet'
                : 'No manhwa matching your filter'}
            </h3>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto mt-1">
              {activeTab === 'favorites'
                ? 'Click the bookmark ribbon on any manhwa card to save it here for quick access.'
                : 'Try clearing your search query or selecting a different genre.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
            {filteredCatalog.map((series) => (
              <ManhwaCard key={series.id} series={series} />
            ))}
          </div>
        ) : (
          /* List Mode */
          <div className="space-y-3">
            {filteredCatalog.map((series) => {
              const latestCh = series.latestChapter?.chapter_number || series.chapterCount || 1;
              return (
                <div
                  key={series.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40 hover-lift shadow-xs transition-all"
                >
                  <Link
                    href={`/series/${series.slug || series.id}`}
                    className="flex items-center gap-4 flex-1 min-w-0 group"
                  >
                    <div className="relative w-16 h-22 rounded-2xl overflow-hidden bg-[var(--bg-surface)] shrink-0 border border-[var(--border-subtle)]">
                      {series.cover && (
                        <Image
                          src={series.cover}
                          alt={series.title}
                          fill
                          sizes="70px"
                          className="object-cover group-hover:scale-108 transition-transform duration-300"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          {series.status || 'Ongoing'}
                        </span>
                        {series.rating && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-400" />
                            <span>{series.rating}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm sm:text-base text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {series.title}
                      </h3>

                      <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-1">
                        {series.synopsis || `${series.author} • ${series.genres?.join(', ')}`}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-[var(--text-secondary)] mt-2">
                        <span>{series.chapterCount} Chapters</span>
                        <span>•</span>
                        <span>{series.viewsCount} Reads</span>
                        <span>•</span>
                        <span>{series.releaseDay}s</span>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2.5 sm:self-center shrink-0">
                    <Link
                      href={`/reader/${series.slug}/${latestCh}`}
                      className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Read Ch. {latestCh}</span>
                    </Link>
                    <Link
                      href={`/series/${series.slug || series.id}`}
                      className="px-3.5 py-2 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] text-xs font-semibold transition-all"
                    >
                      Overview
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Reusable Support Creators Modal */}
      <SupportCreatorModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        creatorName="Studio Reader Creators"
      />
    </main>
  );
}
