'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  BookOpen,
  Menu,
  X,
  ArrowLeft,
  LogOut,
  Upload,
  Library,
  Sun,
  Moon,
  Sparkles,
  BarChart3,
  Layers,
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

export default function AuthorLayout({ children }) {
  const { user, isLoading } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
      {/* Mobile Top Bar */}
      <div className="sm:hidden flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400 font-bold">
              Creator Studio
            </p>
            <p className="text-[10px] text-[var(--text-muted)] font-medium -mt-0.5">Lumina Author</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle Theme"
            className="p-2 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-all cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>

          {/* Menu button */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            type="button"
            aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
            className="p-2 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-main)] transition-all cursor-pointer"
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="sm:hidden border-b border-[var(--border-subtle)] p-4 space-y-3 bg-[var(--bg-card)]/95 backdrop-blur-2xl animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            <Link
              href="/author"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Publish & Manage Chapters</span>
            </Link>
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Reader Home</span>
            </Link>
          </div>

          {!isLoading && user && (
            <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold ring-2 ring-indigo-500/20 shrink-0">
                  {(user.name || user.email || 'A')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[var(--text-main)] truncate">{user.name || 'Author'}</p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">{user.email}</p>
                </div>
              </div>
              <a
                href="/auth/logout"
                className="flex items-center justify-center gap-2 text-xs px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl border border-rose-500/20 transition-colors font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </a>
            </div>
          )}
        </div>
      )}

      <div className="sm:flex">
        {/* Desktop Sidebar (Light & Dark mode fully optimized) */}
        <aside className="hidden sm:flex w-64 bg-[var(--bg-card)] border-r border-[var(--border-subtle)] flex-col justify-between fixed h-full p-6 transition-colors duration-200">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/25">
                <BookOpen className="w-5 h-5" strokeWidth={2.2} />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 font-extrabold">
                  Creator Studio
                </p>
                <p className="text-[11px] text-[var(--text-muted)] font-medium">Lumina Publishing</p>
              </div>
            </div>

            <nav className="space-y-1.5 pt-2">
              <Link
                href="/author"
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 text-xs font-bold shadow-xs transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Publish Chapters</span>
              </Link>

              <Link
                href="/"
                className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] text-xs font-medium transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Reader</span>
              </Link>
            </nav>
          </div>

          <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
            {/* Theme Toggle Button */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Theme Mode</span>
              <button
                onClick={toggleTheme}
                type="button"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] shadow-xs hover:border-indigo-500 transition-all cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>

            {/* Author Profile Footer */}
            {!isLoading && user && (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold ring-2 ring-indigo-500/20 shrink-0">
                    {(user.name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[var(--text-main)] truncate">{user.name || 'Author'}</p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</p>
                  </div>
                </div>

                <a
                  href="/auth/logout"
                  className="flex items-center justify-center gap-2 text-center text-xs px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-2xl transition-colors border border-rose-500/20 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </a>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 sm:ml-64 min-w-0">{children}</div>
      </div>
    </div>
  );
}
