'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
  SlidersHorizontal,
  RotateCcw,
  Compass,
} from 'lucide-react';
import HeroCarousel from '../../components/HeroCarousel';
import ContinueReading from '../../components/ContinueReading';
import DailySchedule from '../../components/DailySchedule';
import ManhwaCard from '../../components/ManhwaCard';
import SupportCreatorModal, {
  SupportCreatorBanner,
} from '../../components/SupportCreatorModal';
import { GENRE_LIST, DAYS_OF_WEEK } from '../../lib/series-metadata';

export default function CatalogClient({ seriesList = [], userHistory = [] }) {
  // Navigation & section view: 'discover' | 'schedule' | 'rankings' | 'library' | 'bookmarks'
  const [sectionView, setSectionView] = useState('discover');

  // Filter states
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Ongoing' | 'Completed'
  const [lengthFilter, setLengthFilter] = useState('all'); // 'all' | 'short' (<10) | 'medium' (10-50) | 'long' (50+)
  const [scheduleFilter, setScheduleFilter] = useState('all'); // 'all' | Monday-Sunday
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'title', 'chapters', 'rating', 'latest'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [rankingTab, setRankingTab] = useState('views'); // 'views', 'chapters', 'rating'
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

  // Sync with URL Hash changes (e.g. #schedule, #rankings, #catalog, #favorites, #latest)
  const syncHashToView = useCallback(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.toLowerCase();
    if (hash === '#schedule') {
      setSectionView('schedule');
    } else if (hash === '#rankings' || hash === '#leaderboard') {
      setSectionView('rankings');
    } else if (hash === '#catalog' || hash === '#library') {
      setSectionView('library');
    } else if (hash === '#favorites' || hash === '#bookmarks') {
      setSectionView('bookmarks');
    } else if (hash === '#latest' || hash === '#updates') {
      setSectionView('discover');
      setTimeout(() => {
        document.getElementById('fresh-drops')?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else if (hash === '#discover' || hash === '' || hash === '#') {
      setSectionView('discover');
    }
  }, []);

  useEffect(() => {
    syncHashToView();
    window.addEventListener('hashchange', syncHashToView);
    return () => window.removeEventListener('hashchange', syncHashToView);
  }, [syncHashToView]);

  // Switch tabs and update URL hash cleanly
  const handleTabSwitch = (newView) => {
    setSectionView(newView);
    if (typeof window !== 'undefined') {
      const hash =
        newView === 'discover'
          ? ''
          : newView === 'library'
          ? '#catalog'
          : newView === 'bookmarks'
          ? '#favorites'
          : `#${newView}`;
      window.history.replaceState(null, '', hash ? hash : window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset all catalog filters
  const resetFilters = () => {
    setSelectedGenre('All');
    setStatusFilter('all');
    setLengthFilter('all');
    setScheduleFilter('all');
    setSearchQuery('');
    setSortBy('popular');
  };

  const hasActiveFilters =
    selectedGenre !== 'All' ||
    statusFilter !== 'all' ||
    lengthFilter !== 'all' ||
    scheduleFilter !== 'all' ||
    searchQuery.trim() !== '';

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

  // Today's day name in English
  const todayName = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  // Today's releases
  const todaysReleases = useMemo(() => {
    return seriesList.filter((s) => (s.releaseDay || 'Monday') === todayName);
  }, [seriesList, todayName]);

  // Top 10 Leaderboard series based on selected ranking tab
  const rankedLeaderboard = useMemo(() => {
    return [...seriesList]
      .sort((a, b) => {
        if (rankingTab === 'chapters') return b.chapterCount - a.chapterCount;
        if (rankingTab === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
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

  // Bookmarked series
  const bookmarkedSeries = useMemo(() => {
    return seriesList.filter(
      (s) => bookmarkedIds.includes(s.slug) || bookmarkedIds.includes(s.id)
    );
  }, [seriesList, bookmarkedIds]);

  // Filtered & Sorted All Series (for Library tab)
  const filteredCatalog = useMemo(() => {
    return seriesList
      .filter((item) => {
        // Genre filter
        if (selectedGenre !== 'All') {
          const matchGenre = item.genres?.some((g) => g.toLowerCase() === selectedGenre.toLowerCase());
          if (!matchGenre) return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
          if (item.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
        }

        // Length filter
        if (lengthFilter === 'short' && item.chapterCount >= 10) return false;
        if (lengthFilter === 'medium' && (item.chapterCount < 10 || item.chapterCount > 50)) return false;
        if (lengthFilter === 'long' && item.chapterCount <= 50) return false;

        // Schedule day filter
        if (scheduleFilter !== 'all') {
          if ((item.releaseDay || 'Monday') !== scheduleFilter) return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchAuthor = item.author?.toLowerCase().includes(q);
          const matchSynopsis = item.synopsis?.toLowerCase().includes(q);
          const matchGenre = item.genres?.some((g) => g.toLowerCase().includes(q));
          if (!matchTitle && !matchAuthor && !matchSynopsis && !matchGenre) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'chapters') return b.chapterCount - a.chapterCount;
        if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (sortBy === 'latest') {
          const tA = a.latestChapterCreatedAt ? new Date(a.latestChapterCreatedAt).getTime() : 0;
          const tB = b.latestChapterCreatedAt ? new Date(b.latestChapterCreatedAt).getTime() : 0;
          return tB - tA;
        }
        return (b.rawViewsCount || 0) - (a.rawViewsCount || 0) || b.chapterCount - a.chapterCount;
      });
  }, [seriesList, selectedGenre, statusFilter, lengthFilter, scheduleFilter, searchQuery, sortBy]);

  // Central Hub Navigation Bar Component
  const renderHubNav = () => {
    const tabs = [
      { id: 'discover', label: 'Discover', icon: Compass },
      { id: 'schedule', label: 'Schedule', icon: Calendar },
      { id: 'rankings', label: 'Leaderboard', icon: Trophy },
      { id: 'library', label: `Library (${seriesList.length})`, icon: Layers },
      { id: 'bookmarks', label: `Saved (${bookmarkedIds.length})`, icon: Bookmark },
    ];

    return (
      <div className="my-6 sm:my-8 flex justify-center px-2">
        <nav
          className="inline-flex items-center gap-1 sm:gap-1.5 p-1.5 rounded-full bg-[var(--bg-card)]/90 backdrop-blur-2xl border border-[var(--border-subtle)] dark:border-white/10 shadow-xl shadow-black/5 dark:shadow-black/30 overflow-x-auto max-w-full no-scrollbar"
          aria-label="Content Sections"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = sectionView === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabSwitch(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 scale-102'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 relative">
      {/* Ambient background glowing orbs */}
      <div className="fixed top-24 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-600/5 blur-[120px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="fixed bottom-32 right-1/4 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-600/5 blur-[120px] pointer-events-none -z-10 animate-float-gentle" />

      {/* =========================================================================
          VIEW 1: CURATED DISCOVER (DEFAULT FRONT PAGE)
          ========================================================================= */}
      {sectionView === 'discover' && (
        <div key="view-discover" className="animate-tab-switch space-y-10 sm:space-y-14">
          {/* 1. Hero Spotlight Carousel */}
          <HeroCarousel featuredList={featured} />

          {/* 2. Interactive Section Hub Bar */}
          {renderHubNav()}

          {/* 3. Continue Reading Shelf (Only rendered if user has reading history) */}
          <ContinueReading seriesList={seriesList} initialHistory={userHistory} />

          {/* 4. Today's Releases Spotlight */}
          <section className="bg-gradient-to-br from-indigo-950/20 via-[var(--bg-card)] to-violet-950/20 border border-indigo-500/20 rounded-[32px] sm:rounded-[40px] p-5 sm:p-7 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Releasing Today • {todayName}</span>
                </div>
                <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[var(--text-main)]">
                  Today&apos;s Chapter Drops
                </h2>
              </div>
              <button
                onClick={() => handleTabSwitch('schedule')}
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-all cursor-pointer self-start sm:self-auto"
              >
                <span>Full 7-Day Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaysReleases.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {todaysReleases.slice(0, 5).map((series) => (
                  <ManhwaCard key={series.id} series={series} />
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-[var(--bg-surface)]/60 text-center space-y-2">
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
                  No new chapter scheduled for {todayName}.
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Check out the full release timetable or explore our catalog for fresh reads.
                </p>
              </div>
            )}
          </section>

          {/* 5. Trending Podium & Top 5 */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>Trending Reader Favorites</span>
                </div>
                <h2 className="font-serif-display text-xl sm:text-3xl font-bold text-[var(--text-main)]">
                  Popular & Recommended
                </h2>
              </div>
              <button
                onClick={() => handleTabSwitch('rankings')}
                type="button"
                className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                <span>View Leaderboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
              {popularSeries.slice(0, 5).map((series, idx) => (
                <ManhwaCard key={series.id} series={series} rank={idx + 1} />
              ))}
            </div>
          </section>

          {/* 6. Quick Genre Explorer Strip */}
          <section className="bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-subtle)] dark:border-white/10 rounded-[32px] p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Explore by Genre
                </h3>
              </div>
              <button
                onClick={() => handleTabSwitch('library')}
                type="button"
                className="text-xs font-bold text-indigo-500 hover:underline cursor-pointer"
              >
                All Genres →
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['Action', 'Fantasy', 'Romance', 'Martial Arts', 'Sci-Fi', 'Comedy', 'Supernatural', 'Adventure'].map((genre) => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    setSelectedGenre(genre);
                    handleTabSwitch('library');
                  }}
                  className="px-4 py-2 rounded-full text-xs font-bold bg-[var(--bg-surface)] hover:bg-indigo-600 hover:text-white border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-all cursor-pointer shrink-0 shadow-xs"
                >
                  {genre}
                </button>
              ))}
            </div>
          </section>

          {/* 7. Fresh Chapter Releases Feed */}
          <section id="fresh-drops">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-400 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  <span>Fresh Drops</span>
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
                    className="flex items-center gap-3.5 p-3.5 rounded-[28px] bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-subtle)] hover:border-indigo-500/50 shadow-xs card-expand shimmer-shine transition-all group"
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
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xs">
                          Ch. {latestCh.chapter_number}
                        </span>
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          NEW
                        </span>
                      </div>

                      <h3 className="font-bold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-indigo-500 transition-colors truncate">
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

          {/* 8. Support Creators Banner */}
          <SupportCreatorBanner
            onOpenModal={() => setIsSupportModalOpen(true)}
            creatorName="Independent Creators"
          />

          {/* 9. Explore Full Catalog CTA Box */}
          <div className="p-8 sm:p-10 rounded-[36px] bg-gradient-to-r from-violet-900/30 via-indigo-900/20 to-purple-900/30 border border-violet-500/20 text-center space-y-4 shadow-xl">
            <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-white">
              Looking for More Stories?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
              Explore our complete library of {seriesList.length} manhwa with deep search, genre tags, and reading filters.
            </p>
            <button
              onClick={() => handleTabSwitch('library')}
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-violet-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Browse Full Library</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: DEDICATED WEEKLY SCHEDULE
          ========================================================================= */}
      {sectionView === 'schedule' && (
        <div key="view-schedule" className="animate-tab-switch space-y-6">
          {renderHubNav()}
          <DailySchedule seriesList={seriesList} />
        </div>
      )}

      {/* =========================================================================
          VIEW 3: DEDICATED TOP 10 RANKINGS & LEADERBOARD
          ========================================================================= */}
      {sectionView === 'rankings' && (
        <div key="view-rankings" className="animate-tab-switch space-y-6">
          {renderHubNav()}

          <section className="my-6 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 mb-1">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span>Platform Leaderboard</span>
                </div>
                <h2 className="font-serif-display text-xl sm:text-3xl font-bold text-[var(--text-main)]">
                  Top 10 Rankings
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Realtime platform popularity measured across active reader sessions
                </p>
              </div>

              {/* Ranking Mode Tabs */}
              <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-subtle)] shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setRankingTab('views')}
                  type="button"
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
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
                    className={`relative p-5 sm:p-6 rounded-[32px] border transition-all duration-300 card-expand shimmer-shine group overflow-hidden flex items-center gap-4 ${
                      rank === 1
                        ? 'bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-amber-500/5 border-amber-500/40 shadow-xl shadow-amber-500/5'
                        : rank === 2
                        ? 'bg-gradient-to-br from-slate-400/10 via-[var(--bg-card)] to-transparent border-slate-400/30'
                        : 'bg-gradient-to-br from-amber-800/10 via-[var(--bg-card)] to-transparent border-amber-800/30'
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-md ${
                        rank === 1
                          ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-neutral-950 shadow-amber-500/30'
                          : rank === 2
                          ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-neutral-950'
                          : 'bg-gradient-to-br from-amber-700 to-amber-900 text-white'
                      }`}
                    >
                      {rank === 1 ? <Crown className="w-6 h-6 fill-current" /> : `#${rank}`}
                    </div>

                    <div className="relative w-18 h-24 rounded-2xl overflow-hidden bg-[var(--bg-surface)] shrink-0 border border-[var(--border-subtle)]">
                      {item.cover ? (
                        <Image
                          src={item.cover}
                          alt={item.title}
                          fill
                          sizes="80px"
                          className="object-cover group-hover:scale-108 transition-transform duration-300 ease-out"
                        />
                      ) : null}
                    </div>

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
                {rankedLeaderboard.slice(3, 10).map((item, idx) => {
                  const rank = idx + 4;
                  return (
                    <Link
                      key={item.id}
                      href={`/series/${item.slug || item.id}`}
                      className="flex items-center gap-3 p-3.5 rounded-[28px] bg-[var(--bg-card)]/90 backdrop-blur-md border border-[var(--border-subtle)] hover:border-indigo-500/50 card-expand shimmer-shine transition-all group"
                    >
                      <span className="w-8 h-8 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] font-bold text-xs flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
                        #{rank}
                      </span>
                      <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-[var(--bg-surface)] shrink-0">
                        {item.cover && (
                          <Image
                            src={item.cover}
                            alt={item.title}
                            fill
                            sizes="50px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
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
        </div>
      )}

      {/* =========================================================================
          VIEW 4: INTERACTIVE FULL LIBRARY & FILTERS
          ========================================================================= */}
      {sectionView === 'library' && (
        <div key="view-library" className="animate-tab-switch space-y-6">
          {renderHubNav()}

          <section id="catalog" className="scroll-mt-24">
            <div className="bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-subtle)] dark:border-white/10 rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 shadow-sm">
              {/* Header & View Mode Switcher */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-[var(--border-subtle)]">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-400 mb-1">
                    <Layers className="w-3.5 h-3.5 text-violet-500" />
                    <span>Interactive Library</span>
                  </div>
                  <h2 className="font-serif-display text-xl sm:text-3xl font-bold text-[var(--text-main)]">
                    All Titles & Filter Catalog
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Showing {filteredCatalog.length} of {seriesList.length} total series
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  {/* View Mode: Grid vs List */}
                  <div className="flex items-center gap-1 p-1 bg-[var(--bg-surface)] rounded-full border border-[var(--border-subtle)]">
                    <button
                      onClick={() => setViewMode('grid')}
                      type="button"
                      aria-label="Grid View"
                      className={`p-2 rounded-full transition-all cursor-pointer ${
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
                      className={`p-2 rounded-full transition-all cursor-pointer ${
                        viewMode === 'list'
                          ? 'bg-[var(--bg-card)] text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Advanced Filters Toggle */}
                  <button
                    onClick={() => setShowAdvancedFilters((v) => !v)}
                    type="button"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      showAdvancedFilters
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters</span>
                  </button>
                </div>
              </div>

              {/* Primary Filter Bar: Search & Sort */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
                {/* Search Box with instant clear */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search series by title, author..."
                    className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl pl-10 pr-9 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
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
                    className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-main)] rounded-2xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500 shadow-xs cursor-pointer"
                  >
                    <option value="popular">Most Popular (Real Reads)</option>
                    <option value="latest">Recently Updated</option>
                    <option value="chapters">Most Chapters</option>
                    <option value="rating">Highest Rated</option>
                    <option value="title">Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Filters Expandable Drawer */}
              {showAdvancedFilters && (
                <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] mb-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                        Release Status
                      </label>
                      <div className="flex items-center gap-1">
                        {['all', 'Ongoing', 'Completed'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                              statusFilter === st
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-main)]'
                            }`}
                          >
                            {st === 'all' ? 'All Status' : st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chapter Length Filter */}
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                        Chapter Count
                      </label>
                      <div className="flex items-center gap-1">
                        {[
                          { id: 'all', label: 'All' },
                          { id: 'short', label: '< 10' },
                          { id: 'medium', label: '10 - 50' },
                          { id: 'long', label: '50+' },
                        ].map((len) => (
                          <button
                            key={len.id}
                            type="button"
                            onClick={() => setLengthFilter(len.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                              lengthFilter === len.id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-main)]'
                            }`}
                          >
                            {len.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Schedule Day Filter */}
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                        Release Day
                      </label>
                      <select
                        value={scheduleFilter}
                        onChange={(e) => setScheduleFilter(e.target.value)}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl px-3 py-2 text-xs text-[var(--text-main)] focus:outline-none focus:border-indigo-500"
                      >
                        <option value="all">Any Day</option>
                        {DAYS_OF_WEEK.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                      <span className="text-xs text-[var(--text-muted)]">Active filters applied</span>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="flex items-center gap-1.5 text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset All Filters</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Genre Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 -mx-2 px-2 no-scrollbar">
                {GENRE_LIST.map((genre) => {
                  const isSelected = selectedGenre === genre;
                  return (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      type="button"
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs scale-102'
                          : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-main)]'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>

              {/* Catalog Display: Visual Grid vs Compact List View */}
              {filteredCatalog.length === 0 ? (
                <div className="py-16 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 p-6 space-y-3">
                  <BookOpen className="w-10 h-10 mx-auto text-indigo-400/40" strokeWidth={1.5} />
                  <h3 className="text-sm font-bold text-[var(--text-main)]">
                    No manhwa matching your current filter
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                    Try selecting a different genre, clearing your search query, or resetting filters.
                  </p>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All Filters</span>
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div key={`grid-${selectedGenre}-${statusFilter}-${lengthFilter}-${scheduleFilter}-${sortBy}`} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 animate-tab-switch">
                  {filteredCatalog.map((series) => (
                    <ManhwaCard key={series.id} series={series} />
                  ))}
                </div>
              ) : (
                /* Compact List Mode */
                <div key={`list-${selectedGenre}-${statusFilter}-${lengthFilter}-${scheduleFilter}-${sortBy}`} className="space-y-3 animate-tab-switch">
                  {filteredCatalog.map((series) => {
                    const latestCh = series.latestChapter?.chapter_number || series.chapterCount || 1;
                    return (
                      <div
                        key={series.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-[28px] bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/40 hover-lift shadow-xs transition-all"
                      >
                        <Link
                          href={`/series/${series.slug || series.id}`}
                          className="flex items-center gap-4 flex-1 min-w-0 group"
                        >
                          <div className="relative w-16 h-22 rounded-2xl overflow-hidden bg-[var(--bg-card)] shrink-0 border border-[var(--border-subtle)]">
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
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
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
                            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Read Ch. {latestCh}</span>
                          </Link>
                          <Link
                            href={`/series/${series.slug || series.id}`}
                            className="px-4 py-2.5 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] text-xs font-bold transition-all"
                          >
                            Overview
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* =========================================================================
          VIEW 5: SAVED BOOKMARKS & FAVORITES
          ========================================================================= */}
      {sectionView === 'bookmarks' && (
        <div key="view-bookmarks" className="animate-tab-switch space-y-6">
          {renderHubNav()}

          <section className="bg-[var(--bg-card)]/90 backdrop-blur-xl border border-[var(--border-subtle)] dark:border-white/10 rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Personal Library</span>
                </div>
                <h2 className="font-serif-display text-xl sm:text-3xl font-bold text-[var(--text-main)]">
                  Saved Bookmarks ({bookmarkedSeries.length})
                </h2>
              </div>
            </div>

            {bookmarkedSeries.length === 0 ? (
              <div className="py-16 text-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 p-6 space-y-4">
                <Bookmark className="w-12 h-12 mx-auto text-indigo-400/40" strokeWidth={1.5} />
                <h3 className="text-base font-bold text-[var(--text-main)]">
                  No Saved Series Yet
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto">
                  Click the bookmark ribbon on any manhwa card or series detail page to keep track of titles you want to read.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabSwitch('discover')}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-violet-600/25 active:scale-95"
                >
                  <Compass className="w-4 h-4" />
                  <span>Discover Manhwa</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
                {bookmarkedSeries.map((series) => (
                  <ManhwaCard key={series.id} series={series} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Reusable Support Creators Modal */}
      <SupportCreatorModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        creatorName="Platform Creators"
      />
    </main>
  );
}
