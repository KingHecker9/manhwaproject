'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Library,
  FileText,
  Clock,
  Sparkles,
  LogOut,
  ChevronRight,
  Bookmark,
  Trash2,
  Moon,
  Sun,
  Laptop,
  Check,
  ExternalLink,
  ShieldCheck,
  User,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function AccountClient({ user, authorized, readingRows = [] }) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'bookmarks' | 'settings'
  const [bookmarkedSeries, setBookmarkedSeries] = useState([]);
  const [historyList, setHistoryList] = useState(readingRows);
  const [historyCleared, setHistoryCleared] = useState(false);

  // Load client bookmarks from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('manhwa_bookmarks');
      if (stored) {
        setBookmarkedSeries(JSON.parse(stored));
      }
    } catch {
      // LocalStorage access error
    }
  }, []);

  const clearLocalHistory = () => {
    if (confirm('Are you sure you want to clear your reading history view?')) {
      setHistoryList([]);
      setHistoryCleared(true);
    }
  };

  // Compute reader metrics
  const uniqueSeriesCount = new Set(historyList.map((r) => r.series_id)).size;
  const chaptersReadCount = historyList.length;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile Header Card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative shrink-0">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.picture}
                alt={user.name || "Profile"}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-indigo-500/20 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-md ring-4 ring-indigo-500/20">
                {(user.name || user.email || 'R')[0].toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xs text-indigo-600 dark:text-indigo-400">
              {authorized ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[var(--text-main)] truncate">
                {user.name || 'Studio Reader'}
              </h1>
              {authorized ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Creator / Author</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Member</span>
                </span>
              )}
            </div>

            <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
              {authorized && (
                <Link
                  href="/author"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Library className="w-3.5 h-3.5" />
                  <span>Open Creator Studio</span>
                </Link>
              )}
              <a
                href="/auth/logout"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-rose-500/40 text-xs font-medium text-[var(--text-secondary)] hover:text-rose-500 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </a>
            </div>
          </div>

          {/* Quick Metrics Pillar */}
          <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 shrink-0 w-full sm:w-auto">
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center sm:text-right min-w-[130px]">
              <p className="text-xl font-extrabold text-[var(--text-main)]">{chaptersReadCount}</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Chapters Read</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center sm:text-right min-w-[130px]">
              <p className="text-xl font-extrabold text-[var(--text-main)]">{uniqueSeriesCount}</p>
              <p className="text-[11px] text-[var(--text-secondary)]">Series Explored</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] mb-6 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Reading History ({historyList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'bookmarks'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Series ({bookmarkedSeries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'settings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Preferences</span>
        </button>
      </div>

      {/* Tab 1: Reading History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-main)]">Your Reading Timeline</h2>
            {historyList.length > 0 && (
              <button
                type="button"
                onClick={clearLocalHistory}
                className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear view</span>
              </button>
            )}
          </div>

          {historyList.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                {historyCleared ? 'Reading history cleared' : 'No reading history yet'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Chapters you open and read in the vertical webtoons reader will automatically be tracked here.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Explore Featured Manhwa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {historyList.map((row, idx) => {
                const seriesTitle = row.series?.title || 'Manhwa Series';
                const seriesSlug = row.series?.slug || row.series_id;
                const chapterNum = row.chapters?.chapter_number || 1;
                const coverUrl = row.series?.cover_url;

                return (
                  <Link
                    key={idx}
                    href={`/reader/${seriesSlug}/${chapterNum}`}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-indigo-500/40 transition-all group shadow-xs"
                  >
                    {/* Cover Thumbnail */}
                    <div className="w-12 h-16 rounded-xl bg-[var(--bg-surface)] overflow-hidden shrink-0 border border-[var(--border-subtle)] relative">
                      {coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={coverUrl}
                          alt={seriesTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-[10px] font-bold">
                          {chapterNum}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {seriesTitle}
                      </p>
                      <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                        Chapter {chapterNum} {row.chapters?.title ? `— ${row.chapters.title}` : ''}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {row.read_at ? new Date(row.read_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently'}
                        </span>
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bookmarks */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[var(--text-main)]">Your Bookmarked Series</h2>
            <span className="text-xs text-[var(--text-muted)]">Saved locally on your device</span>
          </div>

          {bookmarkedSeries.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">No bookmarks saved yet</h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Click the bookmark button on any manhwa card or series page to save titles to your personal reading shelf.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <span>Browse Series Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bookmarkedSeries.map((slug) => (
                <Link
                  key={slug}
                  href={`/series/${slug}`}
                  className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-indigo-500/40 transition-all group space-y-2 text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 capitalize truncate">
                    {slug.replace(/-/g, ' ')}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                    <span>View series</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Preferences */}
      {activeTab === 'settings' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
          <div>
            <h2 className="text-base font-bold text-[var(--text-main)]">Reader Preferences</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Customize your viewing comfort and reading experience.
            </p>
          </div>

          {/* Theme Switcher Setting */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--text-main)] block">Appearance Theme</label>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 text-xs font-semibold transition-all ${
                  theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                }`}
              >
                <Laptop className="w-5 h-5" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Account Security Info */}
          <div className="pt-6 border-t border-[var(--border-subtle)] space-y-3">
            <h3 className="text-xs font-bold text-[var(--text-main)]">Security & Authentication</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Your account is secured via Auth0 Universal Identity. To manage password or multi-factor authentication, visit your identity provider security portal.
            </p>
            <div className="pt-2">
              <a
                href="/auth/logout"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Account</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
