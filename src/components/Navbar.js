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
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <BookOpen className="w-5 h-5" strokeWidth={2} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif-display text-xl font-bold tracking-tight text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Studio Reader
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--text-muted)] -mt-1 font-semibold">
                Webtoons
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search trigger */}
          <button
            onClick={() => onOpenSearch ? onOpenSearch() : window.location.assign('/#catalog')}
            type="button"
            aria-label="Search manhwa"
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] rounded-xl transition-all duration-150 group"
          >
            <Search className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors" strokeWidth={2} />
            <span className="hidden sm:inline">Search manhwa...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded text-[var(--text-muted)]">
              /
            </kbd>
          </button>

          {/* Support Creators / Buy Me a Coffee */}
          <button
            onClick={() => setBmcModalOpen(true)}
            type="button"
            aria-label="Support Creators"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xs hover:shadow-amber-400/25 active:scale-95 transition-all cursor-pointer"
            title="Support creators with Buy Me a Coffee"
          >
            <Coffee className="w-3.5 h-3.5 fill-neutral-950" />
            <span className="hidden sm:inline">Support</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-subtle)] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" strokeWidth={2} />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" strokeWidth={2} />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotificationsOpen((v) => !v)}
              type="button"
              aria-label="Notifications"
              className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-subtle)] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Bell className="w-4 h-4" strokeWidth={2} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-[var(--bg-card)]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-xl py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                    className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[var(--bg-surface)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <Avatar user={user} />
                    <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:inline" strokeWidth={2} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-xl py-2 z-50">
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
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-sm shadow-indigo-600/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
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
            className="lg:hidden p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] border border-[var(--border-subtle)] transition-colors"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-[var(--text-main)]" strokeWidth={2} />
            ) : (
              <Menu className="w-5 h-5 text-[var(--text-main)]" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-[var(--bg-main)] border-t border-[var(--border-subtle)] overflow-y-auto px-6 py-6 flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* Mobile Nav Links */}
            <div className="space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-muted)] font-semibold px-3 mb-2">
                Navigation
              </p>
              {navLinks.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                      active
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/20'
                        : 'text-[var(--text-main)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Additional Secondary Links */}
            <div className="space-y-1 border-t border-[var(--border-subtle)] pt-4">
              <p className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-muted)] font-semibold px-3 mb-2">
                Community & Info
              </p>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setBmcModalOpen(true);
                }}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer"
              >
                <Coffee className="w-4 h-4 fill-neutral-950" />
                <span>☕ Buy Me a Coffee</span>
              </button>
              <Link
                href="/donate"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
              >
                <Heart className="w-4 h-4 text-rose-500" strokeWidth={2} />
                <span>Support Perks & Membership</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)]"
              >
                <BookOpen className="w-4 h-4 text-indigo-500" strokeWidth={2} />
                <span>Contact & Submissions</span>
              </Link>
            </div>
          </div>

          {/* Bottom Account Section in Mobile */}
          <div className="border-t border-[var(--border-subtle)] pt-6 mt-6">
            {!isLoading && (
              <>
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-3 py-2 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)]">
                      <Avatar user={user} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--text-main)] truncate">
                          {user.name || 'Reader'}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/account"
                        onClick={() => setMobileOpen(false)}
                        className="text-center py-2.5 px-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)] hover:border-indigo-500 transition-colors"
                      >
                        My Account
                      </Link>
                      <a
                        href="/auth/logout"
                        className="text-center py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors"
                      >
                        Log Out
                      </a>
                    </div>
                  </div>
                ) : (
                  <a
                    href="/auth/login?returnTo=/"
                    className="block w-full text-center py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all"
                  >
                    Log In / Sign Up
                  </a>
                )}
              </>
            )}
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
