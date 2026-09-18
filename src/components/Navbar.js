/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import SupportCreatorModal from './SupportCreatorModal';

function Avatar({ user }) {
  if (user?.picture) {
    return (
      <img
        src={user.picture}
        alt={user.name || 'Account'}
        className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/40 shadow-xs"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-indigo-500/30 shadow-xs">
      {(user?.name || user?.email || '?')[0].toUpperCase()}
    </div>
  );
}

export default function Navbar({ onOpenSearch }) {
  const pathname = usePathname();
  const { user, isLoading } = useUser();
  const { theme, toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [bmcModalOpen, setBmcModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch real notifications and author broadcasts
  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        if (data.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      } catch (e) {
        console.warn('Could not load notifications:', e.message);
      }
    }
    loadNotifications();
  }, []);

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
    { label: 'Fresh Drops', href: '/#latest', icon: Sparkles },
    { label: 'Catalog', href: '/#catalog', icon: Layers },
    { label: 'About', href: '/about', icon: BookOpen },
  ];

  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    const updateHash = () => {
      if (typeof window !== 'undefined') {
        setCurrentHash(window.location.hash);
      }
    };
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  const isActive = (href) => {
    if (href === '/') return pathname === '/' && (!currentHash || currentHash === '#' || currentHash === '#discover');
    if (href.startsWith('/#')) return pathname === '/' && currentHash === href.replace('/', '');
    return pathname.startsWith(href);
  };

  const handleOpenNotifs = () => {
    setNotificationsOpen((prev) => !prev);
    setHasUnreadNotifs(false);
  };

  return (
    <>
      {/* Centered Floating Rounded Island Top Navigation */}
      <header className="sticky top-2 sm:top-3 z-40 w-full px-3 sm:px-6 pointer-events-none transition-all duration-300">
        <div className="max-w-6xl mx-auto backdrop-blur-xl bg-[var(--bg-card)]/90 dark:bg-[#121520]/90 border border-[var(--border-subtle)] dark:border-white/10 rounded-full sm:rounded-[32px] shadow-xl shadow-black/5 dark:shadow-black/40 px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 pointer-events-auto transition-all">
          {/* Left Section: Brand Logo Island */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full p-1"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-violet-600/30 group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.2} />
              </div>
              <div className="flex flex-col">
                <span className="font-serif-display text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)] group-hover:text-indigo-500 transition-colors">
                  Lumina
                </span>
                <span className="text-[9px] uppercase font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-cyan-400 -mt-1 font-extrabold">
                  Comics
                </span>
              </div>
            </Link>
          </div>

          {/* Center Section: Desktop Pill Navigation */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-full bg-[var(--bg-surface)]/60 border border-[var(--border-subtle)]/60 shadow-xs" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 ${
                    active
                      ? 'text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-md shadow-indigo-600/25'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" strokeWidth={active ? 2.4 : 1.8} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Separate Floating Pill Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Quick Search Button */}
            <button
              onClick={() => (onOpenSearch ? onOpenSearch() : window.location.assign('/#catalog'))}
              type="button"
              aria-label="Search manhwa"
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-full transition-all duration-150 group cursor-pointer shadow-xs"
            >
              <Search className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-indigo-500 transition-colors" strokeWidth={2} />
              <span className="hidden sm:inline font-medium">Search...</span>
              <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md text-[var(--text-muted)]">
                /
              </kbd>
            </button>

            {/* Support Creators / Buy Me a Coffee Button */}
            <button
              onClick={() => setBmcModalOpen(true)}
              type="button"
              aria-label="Support Creators"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-extrabold text-neutral-950 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:brightness-105 rounded-full shadow-xs hover:shadow-amber-400/25 active:scale-95 transition-all cursor-pointer"
              title="Support creators with Buy Me a Coffee"
            >
              <Coffee className="w-3.5 h-3.5 fill-neutral-950" />
              <span>Support</span>
            </button>

            {/* Theme switcher button */}
            <button
              onClick={toggleTheme}
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 sm:p-2.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-main)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] transition-all duration-150 cursor-pointer shadow-xs"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 animate-pulse" strokeWidth={2} />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" strokeWidth={2} />
              )}
            </button>

            {/* Notifications Dropdown (Desktop/Tablet) */}
            <div className="relative hidden md:block" ref={notifRef}>
              <button
                onClick={handleOpenNotifs}
                type="button"
                aria-label="Notifications"
                className="relative p-2 sm:p-2.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-main)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] transition-all duration-150 cursor-pointer shadow-xs"
              >
                <Bell className="w-4 h-4" strokeWidth={2} />
                {hasUnreadNotifs && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full ring-2 ring-[var(--bg-card)] animate-pulse" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-84 bg-[var(--bg-card)]/95 dark:bg-[#121520]/95 backdrop-blur-2xl border border-[var(--border-subtle)] dark:border-white/10 rounded-3xl shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 pb-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
                        Announcements & Alerts
                      </span>
                    </div>
                    <span className="text-[10px] text-indigo-500 font-bold">
                      {notifications.length} updates
                    </span>
                  </div>

                  <div className="divide-y divide-[var(--border-subtle)]/60 text-xs max-h-80 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                        No announcements at this time.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <Link
                          key={notif.id}
                          href={notif.link || '/#latest'}
                          onClick={() => setNotificationsOpen(false)}
                          className="block px-4 py-3 hover:bg-[var(--bg-surface)] transition-colors group"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-400">
                              <Sparkles className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-bold text-[var(--text-main)] group-hover:text-indigo-500 transition-colors truncate">
                                  {notif.title}
                                </p>
                                <span className="text-[9px] text-[var(--text-muted)] shrink-0 font-mono">
                                  {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : 'Recent'}
                                </span>
                              </div>
                              <p className="text-[var(--text-secondary)] text-[11px] mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.message}
                              </p>
                              {notif.author_name && (
                                <span className="inline-block mt-1 text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">
                                  By {notif.author_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))
                    )}
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
                      <div className="absolute right-0 mt-3 w-64 bg-[var(--bg-card)]/95 dark:bg-[#121520]/95 backdrop-blur-2xl border border-[var(--border-subtle)] dark:border-white/10 rounded-3xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-4 py-2.5 border-b border-[var(--border-subtle)]">
                          <p className="text-xs font-bold text-[var(--text-main)] truncate">
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
                            className="flex items-center gap-2.5 px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors font-semibold"
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
                    className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:opacity-95 text-white text-xs font-extrabold tracking-wide transition-all shadow-md shadow-violet-600/25 cursor-pointer"
                  >
                    Log In / Sign Up
                  </a>
                )}
              </>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              type="button"
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              className="lg:hidden p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-main)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] transition-all cursor-pointer shadow-xs"
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-[var(--text-main)]" strokeWidth={2.2} />
              ) : (
                <Menu className="w-5 h-5 text-[var(--text-main)]" strokeWidth={2.2} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Luxury Mobile Slide-Over Glass Drawer (PORTALED to document.body to prevent stacking context clipping) */}
      {mounted && mobileOpen && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-[100] flex justify-end"
        >
          {/* Backdrop blur */}
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          />

          {/* Glass Drawer Panel */}
          <div className="relative w-full max-w-sm bg-neutral-950/95 dark:bg-[#0c0e14]/95 backdrop-blur-2xl border-l border-white/10 h-full flex flex-col justify-between shadow-2xl z-10 overflow-y-auto p-5 pb-safe animate-in slide-in-from-right duration-300">
            <div>
              {/* Top Bar inside Drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-400 text-white flex items-center justify-center shadow-md">
                    <BookOpen className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                  <div>
                    <span className="font-serif-display text-lg font-bold text-white">Lumina</span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 font-bold block -mt-1">
                      Comics
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  type="button"
                  aria-label="Close menu"
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
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-950/60 via-indigo-950/40 to-neutral-900 border border-violet-500/30 space-y-3 shadow-lg">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-violet-400" />
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-violet-300">
                            Welcome Reader
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          Sign in to sync your bookmarks, continue reading anywhere, and support your favorite creators.
                        </p>
                        <a
                          href="/auth/login?returnTo=/"
                          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
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
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-105 text-neutral-950 font-extrabold text-xs shadow-md shadow-amber-400/20 transition-all cursor-pointer"
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
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/25'
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
                  className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold text-violet-400 hover:text-violet-300 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-4 h-4" />
                    <span>Creator Studio Portal</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold border border-violet-500/30">
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
        </div>,
        document.body
      )}

      {/* Global Support Creator Modal */}
      <SupportCreatorModal
        isOpen={bmcModalOpen}
        onClose={() => setBmcModalOpen(false)}
        creatorName="Platform Creators"
      />
    </>
  );
}
