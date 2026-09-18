'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  X,
  BookOpen,
  Star,
  Sparkles,
  ArrowRight,
  Flame,
  Layers,
  Clock,
  Compass,
  TrendingUp,
} from 'lucide-react';

// Intent keywords and semantic synonyms
const INTENT_MAP = {
  alien: ['dandadan', 'sci-fi', 'supernatural'],
  aliens: ['dandadan', 'sci-fi', 'supernatural'],
  ufo: ['dandadan', 'sci-fi'],
  ghost: ['dandadan', 'supernatural'],
  ghosts: ['dandadan', 'supernatural'],
  paranormal: ['dandadan', 'supernatural'],
  spirit: ['supernatural', 'dandadan'],
  spirits: ['supernatural', 'dandadan'],
  momo: ['dandadan'],
  okarun: ['dandadan'],
  curse: ['supernatural', 'action'],
  hunter: ['i-contracted-myself', 'action', 'fantasy'],
  hunters: ['i-contracted-myself', 'action', 'fantasy'],
  contract: ['i-contracted-myself'],
  system: ['i-contracted-myself', 'system'],
  level: ['system', 'action', 'fantasy'],
  leveling: ['system', 'action', 'fantasy'],
  awakener: ['i-contracted-myself', 'fantasy'],
  constellation: ['i-contracted-myself', 'fantasy'],
  magic: ['fantasy', 'supernatural'],
  sword: ['action', 'fantasy'],
  dungeon: ['action', 'fantasy'],
  reborn: ['reincarnation', 'fantasy'],
  reincarnate: ['reincarnation', 'fantasy'],
  transcend: ['i-contracted-myself', 'fantasy'],
  future: ['i-contracted-myself', 'sci-fi'],
  fight: ['action'],
  battle: ['action'],
  romance: ['romance', 'dandadan'],
  love: ['romance'],
  funny: ['comedy', 'dandadan'],
  comedy: ['comedy', 'dandadan'],
};

// Levenshtein distance helper for typo tolerance (handles typos like "dandadn" or "contarct")
function levenshteinDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

export default function SearchModal({ isOpen, onClose, seriesList: initialSeriesList = [] }) {
  const [query, setQuery] = useState('');
  const [seriesList, setSeriesList] = useState(initialSeriesList);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Sync prop or fetch if seriesList is empty
  useEffect(() => {
    if (initialSeriesList.length > 0) {
      setSeriesList(initialSeriesList);
    } else if (isOpen) {
      fetch('/api/series')
        .then((res) => res.json())
        .then((data) => {
          if (data.series && Array.isArray(data.series)) {
            setSeriesList(data.series);
          }
        })
        .catch((err) => console.warn('SearchModal fallback fetch failed:', err));
    }
  }, [initialSeriesList, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
      setSelectedIndex(0);
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scoring-based Fuzzy + Semantic Search
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const tokens = q.split(/\s+/).filter((t) => t.length > 0);
    const intentExpansions = new Set();

    tokens.forEach((t) => {
      if (INTENT_MAP[t]) {
        INTENT_MAP[t].forEach((v) => intentExpansions.add(v));
      }
    });

    const isAskingForPopular = ['popular', 'top', 'trending', 'most', 'best'].some((k) => q.includes(k));
    const isAskingForNew = ['new', 'latest', 'recent', 'fresh', 'update'].some((k) => q.includes(k));

    const scored = seriesList.map((item) => {
      let score = 0;
      const title = (item.title || '').toLowerCase();
      const alt = (item.alternativeTitle || '').toLowerCase();
      const author = (item.author || '').toLowerCase();
      const synopsis = (item.synopsis || '').toLowerCase();
      const slug = (item.slug || '').toLowerCase();
      const genres = (item.genres || []).map((g) => g.toLowerCase());

      // 1. Direct title matches
      if (title === q) score += 120;
      else if (title.startsWith(q)) score += 80;
      else if (title.includes(q)) score += 60;

      // 2. Alt title / Slug matches
      if (alt.includes(q)) score += 45;
      if (slug.includes(q)) score += 40;

      // 3. Author matches
      if (author.includes(q)) score += 35;

      // 4. Token & word matches
      tokens.forEach((tok) => {
        if (title.includes(tok)) score += 25;
        if (genres.some((g) => g.includes(tok))) score += 30;
        if (synopsis.includes(tok)) score += 20;

        // Typo tolerance: Levenshtein distance check against title words
        const titleWords = title.split(/[\s\-:]+/);
        titleWords.forEach((tw) => {
          if (Math.abs(tw.length - tok.length) <= 2) {
            const dist = levenshteinDistance(tok, tw);
            if (dist <= 2 && dist > 0) {
              score += 28 - dist * 8; // Typo match
            }
          }
        });
      });

      // 5. Semantic / intent match
      intentExpansions.forEach((intent) => {
        if (slug.includes(intent) || title.includes(intent)) score += 40;
        if (genres.some((g) => g.includes(intent))) score += 25;
        if (synopsis.includes(intent)) score += 15;
      });

      // 6. Generic intent boosts
      if (isAskingForPopular) {
        score += Math.min(30, (item.rawViewsCount || 0) / 10);
      }
      if (isAskingForNew && item.latestChapterCreatedAt) {
        score += 20;
      }

      return { item, score };
    });

    return scored
      .filter((entry) => entry.score > 10)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }, [query, seriesList]);

  // Handle arrow key navigation in search results
  const handleInputKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, searchResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + Math.max(1, searchResults.length)) % Math.max(1, searchResults.length));
    } else if (e.key === 'Enter' && searchResults.length > 0) {
      e.preventDefault();
      const target = searchResults[selectedIndex] || searchResults[0];
      if (target) {
        window.location.assign(`/series/${target.slug || target.id}`);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  const quickSearchTags = [
    { label: '🔥 Most Popular', q: 'popular' },
    { label: '⚡ Dandadan', q: 'Dandadan' },
    { label: '⚔️ I Contracted Myself', q: 'Contract' },
    { label: '✨ Supernatural', q: 'Supernatural' },
    { label: '🔮 Fantasy', q: 'Fantasy' },
    { label: '💥 Action', q: 'Action' },
    { label: '🛸 Sci-Fi', q: 'Sci-Fi' },
    { label: '💖 Romance', q: 'Romance' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)]/95 dark:bg-[#121520]/95 backdrop-blur-2xl border border-[var(--border-subtle)] dark:border-white/10 rounded-[32px] sm:rounded-[36px] shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 sm:px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/30">
          <Search className="w-5 h-5 text-indigo-500 shrink-0" strokeWidth={2.2} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onKeyDown={handleInputKeyDown}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search titles, genres, aliens, hunters, magic, synopses..."
            className="w-full bg-transparent text-[var(--text-main)] placeholder:text-[var(--text-muted)] text-sm sm:text-base focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              type="button"
              className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          )}
          <button
            onClick={onClose}
            type="button"
            className="px-2.5 py-1 text-[11px] font-mono text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Chips (Shown always for fast browsing) */}
        <div className="px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/20 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[var(--text-muted)] shrink-0 mr-1">
            Quick:
          </span>
          {quickSearchTags.map((tag) => (
            <button
              key={tag.label}
              onClick={() => setQuery(tag.q)}
              type="button"
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                query.toLowerCase() === tag.q.toLowerCase()
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-transparent shadow-xs'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-indigo-500/40 hover:text-[var(--text-main)]'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-2 flex-1">
          {query.trim() === '' ? (
            /* Idle / Exploratory State */
            <div className="py-10 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                <Sparkles className="w-6 h-6" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                Smart Semantic Search
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto mt-1 leading-relaxed">
                Type any title, creator, genre, or keyword like &quot;aliens&quot;, &quot;hunter&quot;, &quot;supernatural&quot;, or &quot;popular&quot;.
              </p>
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                Pro tip: Press <kbd className="font-mono bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">↑</kbd> <kbd className="font-mono bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">↓</kbd> to navigate and <kbd className="font-mono bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">Enter</kbd> to open.
              </div>
            </div>
          ) : searchResults.length === 0 ? (
            /* No Results Found */
            <div className="py-12 px-4 text-center space-y-3">
              <BookOpen className="w-10 h-10 mx-auto text-indigo-400/40" strokeWidth={1.5} />
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                No matching series for &quot;{query}&quot;
              </h3>
              <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
                Try searching for broader keywords like &quot;Action&quot;, &quot;Fantasy&quot;, &quot;Supernatural&quot;, or click one of the quick tags above.
              </p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xs hover:bg-indigo-500 transition-all cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            /* Results List */
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 pb-1 text-[11px] text-[var(--text-muted)] font-mono">
                <span>{searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'} found</span>
                <span>Semantic & Intent Ranked</span>
              </div>
              {searchResults.map((series, idx) => {
                const isSelected = selectedIndex === idx;
                return (
                  <Link
                    key={series.id}
                    href={`/series/${series.slug || series.id}`}
                    onClick={onClose}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl border transition-all duration-150 group ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-500/10 via-[var(--bg-surface)] to-transparent border-indigo-500/40 shadow-xs'
                        : 'bg-transparent border-transparent hover:bg-[var(--bg-surface)]/60 hover:border-[var(--border-subtle)]'
                    }`}
                  >
                    {/* Cover Thumbnail */}
                    <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-[var(--bg-surface)] shrink-0 border border-[var(--border-subtle)]">
                      {series.cover ? (
                        <Image
                          src={series.cover}
                          alt={series.title}
                          fill
                          sizes="60px"
                          className="object-cover group-hover:scale-108 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-[var(--text-muted)] font-bold">
                          📖
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {series.title}
                        </h4>
                        {series.rating && (
                          <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500 shrink-0">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {series.rating}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {series.author} • {series.chapterCount || 0} chapters • {series.releaseDay || 'Weekly'}s
                      </p>

                      <div className="flex items-center gap-1 mt-1.5 overflow-hidden">
                        {(series.genres || []).slice(0, 3).map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 truncate"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <ArrowRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected
                          ? 'text-indigo-500 translate-x-1'
                          : 'text-[var(--text-muted)] group-hover:text-indigo-500 group-hover:translate-x-0.5'
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)]/40 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span>Press ESC or click outside to dismiss</span>
          <span className="font-semibold text-indigo-500">Lumina Intelligent Search</span>
        </div>
      </div>
    </div>
  );
}
