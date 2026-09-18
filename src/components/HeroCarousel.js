'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Bookmark,
  Star,
  ChevronLeft,
  ChevronRight,
  Flame,
  Calendar,
} from 'lucide-react';

export default function HeroCarousel({ featuredList = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [bookmarkedMap, setBookmarkedMap] = useState({});

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_series') || '[]');
      const map = {};
      saved.forEach((id) => (map[id] = true));
      setBookmarkedMap(map);
    } catch (e) {}
  }, []);

  // Auto slide every 6 seconds unless hovered
  useEffect(() => {
    if (featuredList.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [featuredList.length, isHovered]);

  if (!featuredList || featuredList.length === 0) return null;

  const current = featuredList[currentIndex];
  const isBookmarked = !!bookmarkedMap[current.slug || current.id];

  const toggleBookmark = (e) => {
    e.preventDefault();
    try {
      const saved = JSON.parse(localStorage.getItem('bookmarked_series') || '[]');
      const id = current.slug || current.id;
      let next;
      if (saved.includes(id)) {
        next = saved.filter((item) => item !== id);
        setBookmarkedMap((prev) => ({ ...prev, [id]: false }));
      } else {
        next = [...saved, id];
        setBookmarkedMap((prev) => ({ ...prev, [id]: true }));
      }
      localStorage.setItem('bookmarked_series', JSON.stringify(next));
      window.dispatchEvent(new Event('bookmarks_updated'));
    } catch (e) {}
  };

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 45) {
      nextSlide();
    } else if (distance < -45) {
      prevSlide();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full rounded-3xl overflow-hidden bg-neutral-950 text-white shadow-xl border border-[var(--border-subtle)] my-4 sm:my-6 min-h-[380px] sm:min-h-[460px] flex items-center"
    >
      {/* Background Cover with Cinematic Blur & Gradient */}
      <div className="absolute inset-0 z-0">
        {current.banner || current.cover ? (
          <Image
            src={current.banner || current.cover}
            alt={current.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-cover object-center opacity-30 scale-105 filter blur-xs transition-all duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-950/80 via-neutral-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-black/30 z-10" />
      </div>

      {/* Slide Content Grid */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-10 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
        {/* Left Column: Information & Actions */}
        <div className="md:col-span-8 space-y-3 sm:space-y-4 text-left">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <Flame className="w-3.5 h-3.5" />
              <span>Featured</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-md text-white border border-white/10">
              <Calendar className="w-3 h-3 text-indigo-400" />
              <span>{current.releaseDay} Release</span>
            </span>

            {current.rating && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-amber-300 border border-amber-400/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{current.rating}</span>
              </span>
            )}
          </div>

          {/* Series Title */}
          <div>
            <h1 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight drop-shadow-md">
              {current.title}
            </h1>
            {current.alternativeTitle && (
              <p className="text-xs sm:text-sm text-neutral-300 font-medium mt-1">
                {current.alternativeTitle}
              </p>
            )}
          </div>

          {/* Genres Chips */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-0.5">
            {(current.genres || []).map((genre) => (
              <span
                key={genre}
                className="px-2.5 py-0.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-medium bg-white/10 backdrop-blur-md text-neutral-200 border border-white/5"
              >
                {genre}
              </span>
            ))}
          </div>

          {/* Synopsis Snippet */}
          <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 sm:line-clamp-3 max-w-2xl leading-relaxed">
            {current.synopsis}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2">
            <Link
              href={`/series/${current.slug || current.id}`}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all duration-200"
            >
              <BookOpen className="w-4 h-4" strokeWidth={2} />
              <span>Read Now</span>
            </Link>

            <button
              onClick={toggleBookmark}
              type="button"
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border text-xs sm:text-sm font-semibold backdrop-blur-md transition-all duration-200 ${
                isBookmarked
                  ? 'bg-white/20 border-indigo-400 text-indigo-300'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} strokeWidth={2} />
              <span>{isBookmarked ? 'Bookmarked' : 'Add to Shelf'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Hero Cover Card Display */}
        <div className="hidden md:flex md:col-span-4 justify-end">
          <div className="relative w-52 lg:w-60 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/15 transition-transform duration-300">
            {current.cover ? (
              <Image
                src={current.cover}
                alt={current.title}
                fill
                sizes="(max-width: 1024px) 240px, 280px"
                className="object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-center">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-300">
                {current.chapterCount || 0} Chapters Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls: Arrows (Hidden on mobile to avoid covering content) */}
      {featuredList.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            type="button"
            aria-label="Previous Slide"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
          <button
            onClick={nextSlide}
            type="button"
            aria-label="Next Slide"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 transition-all"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2">
            {featuredList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                type="button"
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-7 sm:w-8 bg-indigo-500' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
