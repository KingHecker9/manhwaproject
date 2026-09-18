'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Heart,
  Sparkles,
  Compass,
  Calendar,
  Search,
  Bookmark,
  User,
  ShieldCheck,
  Layers
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import SearchModal from '../../components/SearchModal';

export default function ReaderLayout({ children }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [seriesList, setSeriesList] = useState([]);

  // Pre-load series list for search modal
  useEffect(() => {
    // Keyboard shortcut / or Ctrl+K to open search
    const handleKeyDown = (e) => {
      if ((e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') ||
          ((e.metaKey || e.ctrlKey) && e.key === 'k')) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isReaderPage = pathname.startsWith('/reader/');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200">
      {/* Sticky Top Navigation Bar (Hidden on reader page for distraction-free reading) */}
      {!isReaderPage && <Navbar onOpenSearch={() => setSearchOpen(true)} />}

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        seriesList={seriesList}
      />

      {/* Main Page Body (padding bottom on mobile to accommodate mobile navigation bar) */}
      <div className={`flex-1 ${!isReaderPage ? 'pb-20 sm:pb-0' : ''}`}>{children}</div>

      {/* Mobile Bottom Thumb Navigation Bar (Hidden in Webtoons Reader mode) */}
      {!isReaderPage && (
        <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-xl border-t border-[var(--border-subtle)] pb-safe transition-colors shadow-lg">
          <div className="flex items-center justify-around h-14 px-2">
            <Link
              href="/"
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                pathname === '/' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <Compass className="w-5 h-5" strokeWidth={pathname === '/' ? 2.5 : 1.75} />
              <span className="text-[10px] mt-0.5">Explore</span>
            </Link>

            <Link
              href="/#schedule"
              className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
            >
              <Calendar className="w-5 h-5" strokeWidth={1.75} />
              <span className="text-[10px] mt-0.5">Schedule</span>
            </Link>

            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                <Search className="w-4 h-4" strokeWidth={2.25} />
              </div>
            </button>

            <Link
              href="/#catalog"
              className="flex flex-col items-center justify-center flex-1 py-1 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition-colors"
            >
              <Layers className="w-5 h-5" strokeWidth={1.75} />
              <span className="text-[10px] mt-0.5">Library</span>
            </Link>

            <Link
              href="/account"
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                pathname.startsWith('/account') ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
              }`}
            >
              <User className="w-5 h-5" strokeWidth={pathname.startsWith('/account') ? 2.5 : 1.75} />
              <span className="text-[10px] mt-0.5">Profile</span>
            </Link>
          </div>
        </nav>
      )}

      {/* Polished, Modern Desktop/Mobile Footer */}
      {!isReaderPage && (
        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/50 mt-16 sm:mt-24 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand column */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                    <BookOpen className="w-4 h-4" strokeWidth={2} />
                  </div>
                  <span className="font-serif-display text-xl font-bold tracking-tight text-[var(--text-main)]">
                    Studio Reader
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
                  A premium, reader-focused manhwa platform. Read official chapters with continuous vertical scrolling, responsive layouts, and zero distractions.
                </p>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
                  <span>Built for creators and avid readers</span>
                </div>
              </div>

              {/* Navigation links */}
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-main)] font-semibold mb-3">
                  Platform
                </p>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  <li>
                    <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      Home & Featured
                    </Link>
                  </li>
                  <li>
                    <Link href="/#schedule" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      Weekly Schedule
                    </Link>
                  </li>
                  <li>
                    <Link href="/#latest" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      Latest Chapters
                    </Link>
                  </li>
                  <li>
                    <Link href="/#catalog" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      All Series & Genres
                    </Link>
                  </li>
                  <li>
                    <Link href="/author" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium text-indigo-500">
                      Author Portal
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Information links */}
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-[var(--text-main)] font-semibold mb-3">
                  Information
                </p>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  <li>
                    <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      About Studio Reader
                    </Link>
                  </li>
                  <li>
                    <Link href="/donate" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      Support Creators
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      Contact & Submissions
                    </Link>
                  </li>
                  <li>
                    <Link href="/account" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      Reader Account
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom copyright */}
            <div className="border-t border-[var(--border-subtle)] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
              <p>© {new Date().getFullYear()} Studio Reader. All rights reserved.</p>
              <p className="flex items-center gap-1.5">
                <span>Crafted for high definition reading</span>
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
