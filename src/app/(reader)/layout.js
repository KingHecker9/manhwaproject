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
    async function loadSeries() {
      try {
        const res = await fetch('/api/series');
        const data = await res.json();
        if (data.series && Array.isArray(data.series)) {
          setSeriesList(data.series);
        }
      } catch (err) {
        console.warn('Could not prefetch series for search:', err.message);
      }
    }
    loadSeries();
  }, []);

  // Keyboard shortcut / or Ctrl+K to open search
  useEffect(() => {
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

      {/* Main Page Body */}
      <div className="flex-1">{children}</div>

      {/* Mobile Bottom Dock Navigation (Hidden in Webtoons Reader mode) */}
      {!isReaderPage && <MobileBottomNav onOpenSearch={() => setSearchOpen(true)} />}

      {/* Polished, Compact Desktop & Mobile Footer */}
      {!isReaderPage && (
        <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/60 mt-8 sm:mt-14 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24 sm:pb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {/* Brand column: spans full width on mobile, 2 columns on desktop */}
              <div className="col-span-2 space-y-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                    <BookOpen className="w-3.5 h-3.5" strokeWidth={2.4} />
                  </div>
                  <span className="font-serif-display text-lg sm:text-xl font-bold tracking-tight text-[var(--text-main)]">
                    Lumina Comics
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
                  A modern, distraction-free digital comic reading experience. High-definition vertical scrolls, real-time release schedules, and creator support.
                </p>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] pt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Platform Online & Realtime</span>
                </div>
              </div>

              {/* Navigation links */}
              <div className="col-span-1">
                <p className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-main)] font-bold mb-2.5">
                  Platform
                </p>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  <li>
                    <Link href="/" className="hover:text-indigo-500 transition-colors">
                      Discover
                    </Link>
                  </li>
                  <li>
                    <Link href="/#schedule" className="hover:text-indigo-500 transition-colors">
                      Schedule
                    </Link>
                  </li>
                  <li>
                    <Link href="/#latest" className="hover:text-indigo-500 transition-colors">
                      Fresh Drops
                    </Link>
                  </li>
                  <li>
                    <Link href="/#catalog" className="hover:text-indigo-500 transition-colors">
                      Library
                    </Link>
                  </li>
                  <li>
                    <Link href="/author" className="hover:text-indigo-500 transition-colors font-medium text-indigo-500">
                      Author Studio
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Information links */}
              <div className="col-span-1">
                <p className="text-[11px] font-mono uppercase tracking-widest text-[var(--text-main)] font-bold mb-2.5">
                  Explore
                </p>
                <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                  <li>
                    <Link href="/about" className="hover:text-indigo-500 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/donate" className="hover:text-indigo-500 transition-colors">
                      Support Creators
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-indigo-500 transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/account" className="hover:text-indigo-500 transition-colors">
                      My Account
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom copyright */}
            <div className="border-t border-[var(--border-subtle)] mt-6 sm:mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--text-muted)] gap-2">
              <p>© {new Date().getFullYear()} Lumina Comics. All rights reserved.</p>
              <p className="flex items-center gap-1.5">
                <span>Optimized for ultra-smooth 60fps+ reading</span>
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
