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
import MobileBottomNav from '../../components/MobileBottomNav';

export default function ReaderLayout({ children }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [seriesList, setSeriesList] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll percentage for visual indicator
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-200 relative">
      {/* Scroll Progress Indicator */}
      <div
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 z-50 transition-all duration-75 origin-left pointer-events-none"
        style={{ transform: `scaleX(${Math.min(1, Math.max(0, scrollProgress / 100))})` }}
      />

      {/* Sticky Top Navigation Bar (Hidden on reader page for distraction-free reading) */}
      {!isReaderPage && <Navbar onOpenSearch={() => setSearchOpen(true)} />}

      {/* Global Quick Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        seriesList={seriesList}
      />

      {/* Main Page Body (padding bottom on mobile to accommodate mobile navigation bar) */}
      <div className={`flex-1 ${!isReaderPage ? 'pb-24 sm:pb-0' : ''}`}>{children}</div>

      {/* Mobile Bottom Dock Navigation (Hidden in Webtoons Reader mode) */}
      {!isReaderPage && <MobileBottomNav onOpenSearch={() => setSearchOpen(true)} />}

      {/* Polished, Modern Desktop/Mobile Footer */}
      {!isReaderPage && (
        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/50 mt-16 sm:mt-24 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand column */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                    <BookOpen className="w-4 h-4" strokeWidth={2.2} />
                  </div>
                  <span className="font-serif-display text-xl font-bold tracking-tight text-[var(--text-main)]">
                    Lumina Comics
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
                  A premium, reader-focused digital comics platform. Read official manhwa chapters with continuous vertical scrolling, responsive layouts, and zero distractions.
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
                      About Lumina
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
              <p>© {new Date().getFullYear()} Lumina Comics. All rights reserved.</p>
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
