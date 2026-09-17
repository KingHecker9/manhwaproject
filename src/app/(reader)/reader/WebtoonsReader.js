'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Bookmark,
  BookOpen,
  ArrowUp,
  Sparkles,
  CheckCircle2,
  Share2,
  Check,
} from 'lucide-react';

export default function WebtoonsReader({
  series,
  chapter,
  pages = [],
  allChapters = [],
  prevChapter = null,
  nextChapter = null,
}) {
  const router = useRouter();
  const [controlsVisible, setControlsVisible] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100); // 70% to 130%
  const [readProgress, setReadProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const lastScrollY = useRef(0);
  const scrollTimeout = useRef(null);

  // Sync bookmark from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_series') || '[]');
      setIsBookmarked(saved.includes(series.slug) || saved.includes(series.id));
    } catch (e) {}
  }, [series.slug, series.id]);

  // Save read history to local storage
  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem('reading_history') || '[]');
      const filtered = history.filter(
        (h) => !(h.series_slug === series.slug && h.chapter_number === chapter.chapter_number)
      );
      const newEntry = {
        series_id: series.id,
        series_slug: series.slug,
        series_title: series.title,
        chapter_id: chapter.id,
        chapter_number: chapter.chapter_number,
        chapter_title: chapter.title,
        read_at: new Date().toISOString(),
        progress_percentage: 100,
      };
      localStorage.setItem('reading_history', JSON.stringify([newEntry, ...filtered.slice(0, 20)]));
    } catch (e) {}
  }, [series.id, series.slug, series.title, chapter.id, chapter.chapter_number, chapter.title]);

  // Handle scroll to auto-hide overlays on scroll down, show on scroll up
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY.current;

    // Calculate reading progress percentage
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    if (documentHeight > 0) {
      const progress = Math.min(100, Math.max(0, Math.round((currentScrollY / documentHeight) * 100)));
      setReadProgress(progress);
    }

    // If near the top, always show
    if (currentScrollY < 80) {
      setControlsVisible(true);
      lastScrollY.current = currentScrollY;
      return;
    }

    // Scroll Down -> Hide controls
    if (scrollDelta > 15) {
      setControlsVisible(false);
    }
    // Scroll Up -> Show controls
    else if (scrollDelta < -15) {
      setControlsVisible(true);
    }

    lastScrollY.current = currentScrollY;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft' && prevChapter) {
        router.push(`/reader/${series.slug}/${prevChapter.chapter_number}`);
      } else if (e.key === 'ArrowRight' && nextChapter) {
        router.push(`/reader/${series.slug}/${nextChapter.chapter_number}`);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (drawerOpen) setDrawerOpen(false);
        else setControlsVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevChapter, nextChapter, series.slug, router, drawerOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleBookmark = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_series') || '[]');
      const id = series.slug || series.id;
      let next;
      if (saved.includes(id)) {
        next = saved.filter((item) => item !== id);
        setIsBookmarked(false);
      } else {
        next = [...saved, id];
        setIsBookmarked(true);
      }
      localStorage.setItem('bookmarked_series', JSON.stringify(next));
      window.dispatchEvent(new Event('bookmarks_updated'));
    } catch (e) {}
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 select-none">
      {/* Top Floating Header Overlay (Auto-Hides on Scroll Down) */}
      <header
        className={`fixed top-0 inset-x-0 z-50 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80 px-4 sm:px-6 py-3 flex items-center justify-between transition-transform duration-300 ease-out shadow-lg ${
          controlsVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/series/${series.slug}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-300 hover:text-white transition-colors shrink-0"
            title="Return to Series"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Details</span>
          </Link>

          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-semibold text-white truncate">
              {series.title}
            </h1>
            <p className="text-[11px] text-indigo-400 font-medium truncate">
              Chapter {chapter.chapter_number}
              {chapter.title ? ` — ${chapter.title}` : ''}
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-300 hover:text-white transition-colors"
          >
            <List className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Chapters</span>
            <span className="text-[10px] text-neutral-500">({allChapters.length})</span>
          </button>

          <button
            onClick={toggleBookmark}
            type="button"
            aria-label="Bookmark Series"
            className={`p-2 rounded-xl border transition-colors ${
              isBookmarked
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Seamless Vertical Reader Canvas */}
      <main
        onClick={() => setControlsVisible((v) => !v)}
        className="flex flex-col items-center justify-start min-h-screen cursor-pointer pt-0 pb-20"
      >
        <div
          style={{
            maxWidth: `${Math.min(1000, Math.round(800 * (zoomLevel / 100)))}px`,
            width: '100%',
          }}
          className="flex flex-col items-center mx-auto transition-all duration-200"
        >
          {pages.map((page, idx) => (
            <div
              key={page.page_number}
              className="w-full relative m-0 p-0 block border-0 leading-none"
              style={{ lineHeight: 0 }}
            >
              <img
                src={page.image_url}
                alt={`Page ${page.page_number}`}
                loading={idx < 3 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-auto block m-0 p-0 border-0 align-bottom"
                style={{ display: 'block', verticalAlign: 'bottom' }}
              />
            </div>
          ))}

          {/* End of Chapter Action Section */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full px-6 py-16 text-center bg-neutral-900/90 border-t border-neutral-800 rounded-b-3xl my-8 cursor-default space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                You&apos;ve completed Chapter {chapter.chapter_number}!
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                {nextChapter
                  ? `Continue to the next chapter: "${nextChapter.title || `Chapter ${nextChapter.chapter_number}`}"`
                  : 'You have caught up to the latest chapter of this series!'}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {nextChapter ? (
                <Link
                  href={`/reader/${series.slug}/${nextChapter.chapter_number}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
                >
                  <span>Next: Chapter {nextChapter.chapter_number}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : null}

              <Link
                href={`/series/${series.slug}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-sm font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Overview</span>
              </Link>

              <button
                onClick={scrollToTop}
                type="button"
                className="p-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                title="Back to Top"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Floating Navigation Bar (Auto-Hides on Scroll Down) */}
      <footer
        className={`fixed bottom-0 inset-x-0 z-50 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800/80 px-4 sm:px-6 py-3 transition-transform duration-300 ease-out shadow-2xl ${
          controlsVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Previous Chapter Trigger */}
          {prevChapter ? (
            <Link
              href={`/reader/${series.slug}/${prevChapter.chapter_number}`}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Ch. {prevChapter.chapter_number}</span>
              <span className="sm:hidden">Prev</span>
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-neutral-900/40 text-neutral-600 text-xs font-semibold border border-neutral-900 cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
              <span>Start</span>
            </span>
          )}

          {/* Reading Progress Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-20 sm:w-32 bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-150"
                style={{ width: `${readProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-neutral-400 font-semibold w-8">
              {readProgress}%
            </span>
          </div>

          {/* Middle Controls: Zoom & Fullscreen */}
          <div className="hidden md:flex items-center gap-1 bg-neutral-900/80 border border-neutral-800 rounded-xl p-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
              type="button"
              aria-label="Zoom Out"
              title="Zoom Out"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-neutral-300 px-1 w-9 text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 10, 130))}
              type="button"
              aria-label="Zoom In"
              title="Zoom In"
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-neutral-800 mx-0.5" />
            <button
              onClick={toggleFullscreen}
              type="button"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-3.5 h-3.5" />
              ) : (
                <Maximize className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Next Chapter Trigger */}
          {nextChapter ? (
            <Link
              href={`/reader/${series.slug}/${nextChapter.chapter_number}`}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition-all"
            >
              <span className="hidden sm:inline">Ch. {nextChapter.chapter_number}</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/series/${series.slug}`}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-semibold text-neutral-400 hover:text-white transition-colors"
            >
              <span>Overview</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </footer>

      {/* Chapter Selection Slide-Over Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-sm bg-neutral-900 border-l border-neutral-800 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{series.title}</h3>
                <p className="text-xs text-neutral-400">Chapters list</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white bg-neutral-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {allChapters.map((ch) => {
                const isCurrent = Number(ch.chapter_number) === Number(chapter.chapter_number);
                return (
                  <Link
                    key={ch.id}
                    href={`/reader/${series.slug}/${ch.chapter_number}`}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <div className="truncate">
                      <span>Chapter {ch.chapter_number}</span>
                      {ch.title && <span className="text-neutral-400 ml-1.5">— {ch.title}</span>}
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] uppercase font-bold bg-white/20 px-1.5 py-0.5 rounded">
                        Reading
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
