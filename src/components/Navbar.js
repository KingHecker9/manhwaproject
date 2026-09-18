/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  BookOpen,
  Menu,
  X,
  Search,
  Bell,
  Sun,
  Moon,
  Bookmark,
  Calendar,
  Sparkles,
  Compass,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Heart,
  CheckCircle2,
  Coffee,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import SupportCreatorModal from './SupportCreatorModal';

function Avatar({ user }) {
  if (user?.picture) {
    return (
      <img
        src={user.picture}
        alt={user.name || 'Account'}
        className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs ring-2 ring-indigo-500/30">
      {(user?.name || user?.email || '?')[0].toUpperCase()}
    </div>
  );
}

export default function Navbar({ onOpenSearch }) {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const { theme, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [bmcModalOpen, setBmcModalOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open & listen for ESC key
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') setMobileOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileOpen]);

  // Primary navigation links
  const navLinks = [
    { label: 'Home', href: '/', icon: Compass },
    { label: 'Schedule', href: '/#schedule', icon: Calendar },
    { label: 'Latest Updates', href: '/#latest', icon: Sparkles },
    { label: 'All Series', href: '/#catalog', icon: Layers },
    { label: 'About', href: '/about', icon: BookOpen },
  ];

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return pathname === '/' && typeof window !== 'undefined' && window.location.hash === href.replace('/', '');
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--bg-card)]/90 border-b border-[var(--border-subtle)] shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left Section: Brand Logo */}
        <div className="flex items-center gap-8 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-2xl p-1"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-display text-xl font-bold tracking-tight text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Lumina
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-500 dark:text-indigo-400 -mt-1 font-bold">
                Comics
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40 font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={active ? 2.2 : 1.75} />
                  <span>{item.label}</span>
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Search, Notifications, Theme, Auth, Mobile Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Quick Search trigger - icon on mobile, expanded on desktop */}
          <button
            onClick={() => onOpenSearch ? onOpenSearch() : window.location.assign('/#catalog')}
            type="button"
            aria-label="Search manhwa"
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-2xl transition-all duration-150 group cursor-pointer"
          >
            <Search className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-indigo-500 transition-colors" strokeWidth={2} />
            <span className="hidden sm:inline">Search manhwa...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded text-[var(--text-muted)]">
              /
            </kbd>
          </button>

          {/* Support Creators / Buy Me a Coffee - desktop badge */}
          <button
            onClick={() => setBmcModalOpen(true)}
            type="button"
            aria-label="Support Creators"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-2xl shadow-xs hover:shadow-amber-400/25 active:scale-95 transition-all cursor-pointer"
            title="Support creators with Buy Me a Coffee"
          >
            <Coffee className="w-3.5 h-3.5 fill-neutral-950" />
            <span>Support</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-main)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] transition-all duration-150 cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" strokeWidth={2} />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" strokeWidth={2} />
            )}
          </button>

          {/* Notifications Dropdown (Desktop/Tablet) */}
          <div className="relative hidden md:block" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen((v) => !v)}
              type="button"
              aria-label="Notifications"
              className="relative p-2 rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-main)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] transition-all duration-150 cursor-pointer"
            >
              <Bell className="w-4 h-4" strokeWidth={2} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-[var(--bg-card)]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-card)]/95 backdrop-blur-2xl border border-[var(--border-subtle)] rounded-3xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 pb-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-main)]">
                    Notifications
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                    2 updates
                  </span>
                </div>
                <div className="divide-y divide-[var(--border-subtle)]/60 text-xs">
                  <div className="px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors">
                    <div className="flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" strokeWidth={2} />
                      <div>
                        <p className="font-medium text-[var(--text-main)]">Dandadan Chapter 80</p>
                        <p className="text-[var(--text-muted)] text-[11px] mt-0.5">New chapter available to read now!</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={2} />
                      <div>
                        <p className="font-medium text-[var(--text-main)]">Weekly Schedule Updated</p>
                        <p className="text-[var(--text-muted)] text-[11px] mt-0.5">Check Monday-Sunday release tabs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Account / Profile Menu */}
          {!isLoading && (
            <>
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    type="button"
                    aria-label="User Account Menu"
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
                  >
                    <Avatar user={user} />
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:inline" strokeWidth={2} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-[var(--bg-card)]/95 backdrop-blur-2xl border border-[var(--border-subtle)] rounded-3xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
                        <p className="text-xs font-semibold text-[var(--text-main)] truncate">
                          {user.name || 'Reader'}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] truncate">
                          {user.email}
                        </p>
                      </div>

                      <div className="py-1 text-xs">
                        <Link
                          href="/account"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors"
                        >
                          <User className="w-4 h-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
                          <span>My Account</span>
                        </Link>
                        <Link
                          href="/#favorites"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-[var(--text-secondary)]" strokeWidth={1.75} />
                          <span>Bookmarked Titles</span>
                        </Link>
                        <Link
                          href="/author"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors font-medium"
                        >
                          <BookOpen className="w-4 h-4" strokeWidth={1.75} />
                          <span>Creator Studio</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-[var(--border-subtle)]">
                        <a
                          href="/auth/logout"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50/60 dark:hover:bg-rose-950/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" strokeWidth={1.75} />
                          <span>Log Out</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <a
                  href="/auth/login?returnTo=/"
                  className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-indigo-600/25 cursor-pointer"
                >
                  Log In / Sign Up
                </a>
              )}
            </>
          )}

          {/* Mobile Hamburger Trigger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            type="button"
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            className="lg:hidden p-2 rounded-2xl text-[var(--text-secondary)] hover:text-[var(--text-main)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] transition-all cursor-pointer"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-[var(--text-main)]" strokeWidth={2.2} />
            ) : (
              <Menu className="w-5 h-5 text-[var(--text-main)]" strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>

      {/* Luxury Mobile Slide-Over Glass Drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-50 flex justify-end"
        >
          {/* Backdrop blur */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          />

          {/* Glass Drawer Panel */}
          <div className="relative w-full max-w-sm bg-neutral-950/95 dark:bg-neutral-950/95 backdrop-blur-2xl border-l border-white/10 h-full flex flex-col justify-between shadow-2xl z-10 overflow-y-auto p-5 pb-safe animate-in slide-in-from-right duration-300">
            <div>
              {/* Top Bar inside Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md">
                    <BookOpen className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                  <div>
                    <span className="font-serif-display text-lg font-bold text-white">Lumina</span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold block -mt-1">
                      Comics
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  type="button"
                  className="p-2 rounded-2xl bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              {/* Profile / Account Card inside Drawer */}
              <div className="my-4">
                {!isLoading && (
                  <>
                    {user ? (
                      <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{user.name || 'Reader'}</p>
                            <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <Link
                            href="/account"
                            onClick={() => setMobileOpen(false)}
                            className="text-center py-2 px-3 rounded-2xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white transition-colors"
                          >
                            My Account
                          </Link>
                          <a
                            href="/auth/logout"
                            className="text-center py-2 px-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-bold text-rose-300 border border-rose-500/30 transition-colors"
                          >
                            Log Out
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/60 via-purple-950/40 to-neutral-900 border border-indigo-500/30 space-y-3 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-400" />
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">
                            Welcome Reader
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          Sign in to sync your bookmarks, continue reading anywhere, and support your favorite authors.
                        </p>
                        <a
                          href="/auth/login?returnTo=/"
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                        >
                          <span>Sign In / Create Account</span>
                        </a>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Quick Action Pills Grid */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setBmcModalOpen(true);
                  }}
                  type="button"
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-xs shadow-md shadow-amber-400/20 transition-all cursor-pointer"
                >
                  <Coffee className="w-4 h-4 fill-neutral-950" />
                  <span>☕ Tip Creator</span>
                </button>

                <button
                  onClick={toggleTheme}
                  type="button"
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Navigation Sections */}
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold px-3 mb-2">
                  Explore & Read
                </p>
                {navLinks.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                        active
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                          : 'text-neutral-200 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" strokeWidth={active ? 2.5 : 2} />
                        <span>{item.label}</span>
                      </div>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </Link>
                  );
                })}

                <Link
                  href="/author"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-indigo-400 hover:text-indigo-300 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4" />
                    <span>Creator Studio Portal</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    Authors
                  </span>
                </Link>
              </div>
            </div>

            {/* Bottom Info Links */}
            <div className="pt-4 border-t border-white/10 space-y-1 mt-6">
              <Link
                href="/donate"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Perks & Memberships</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-neutral-400 hover:text-white transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Contact & Submissions</span>
              </Link>
              <p className="text-[10px] text-neutral-500 text-center pt-2">
                © {new Date().getFullYear()} Lumina Comics. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Support Creator Modal */}
      <SupportCreatorModal
        isOpen={bmcModalOpen}
        onClose={() => setBmcModalOpen(false)}
        creatorName="Platform Creators"
      />
    </header>
  );
}
