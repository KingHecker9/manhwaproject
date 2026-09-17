/**
 * Metadata enhancement and enrichment helper for Manhwa Series.
 * Provides curated details with graceful fallback to database columns.
 */

const CURATED_SERIES_METADATA = {
  'dandadan': {
    title: 'Dandadan',
    alternativeTitle: 'ダンダダン / Dan Da Dan',
    author: 'Yukinobu Tatsu',
    status: 'Ongoing',
    rating: 4.92,
    releaseDay: 'Monday',
    genres: ['Action', 'Comedy', 'Supernatural', 'Sci-Fi', 'Romance'],
    synopsis:
      'Momo Ayase strikes up an unusual friendship with her school’s UFO fanatic, whom she nicknames "Okarun". While Momo believes in ghosts, she considers aliens nonsense. Her new friend thinks the opposite. To settle their bet, the two visit separate paranormal hotspots and find out that both ghosts and aliens exist in the wildest ways possible!',
    bannerUrl: 'https://jvcnrfmqjnruclesovby.supabase.co/storage/v1/object/public/manhwa-pages/Dandadan.jpg',
    viewsCount: '1.4M',
    bookmarksCount: '84.2K',
    featured: true,
    accentColor: '#6366f1',
  },
  'i-contracted-myself': {
    title: 'I Contracted Myself',
    alternativeTitle: '나 자신과 계약했다 / Contract with Myself',
    author: 'Studio Redice',
    status: 'Ongoing',
    rating: 4.85,
    releaseDay: 'Wednesday',
    genres: ['Action', 'Fantasy', 'Reincarnation', 'System'],
    synopsis:
      'In a world where awakeners sign contracts with constellations and spirits, a hunter who was betrayed at the lowest tier discovers a soul-binding contract system with only one eligible partner: his future transcended self. With double the skills and knowledge of the future, he begins his ascent.',
    bannerUrl: 'https://pub-93430bb912754abc8e23166862ad4fc1.r2.dev/covers/i-contracted-myself.jpg',
    viewsCount: '620K',
    bookmarksCount: '45.1K',
    featured: true,
    accentColor: '#8b5cf6',
  }
};

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function enrichSeries(series) {
  if (!series) return null;
  const slug = series.slug || (series.title ? series.title.toLowerCase().replace(/\s+/g, '-') : '');
  const curated = CURATED_SERIES_METADATA[slug] || {};

  // Deterministic fallback day based on slug if not specified
  const hash = slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbackDay = DEFAULT_DAYS[hash % DEFAULT_DAYS.length];

  return {
    id: series.id,
    slug: series.slug || slug,
    title: series.title || curated.title || 'Untitled Series',
    alternativeTitle: series.alternative_title || curated.alternativeTitle || '',
    cover: series.cover_url || series.cover || curated.bannerUrl || null,
    banner: curated.bannerUrl || series.cover_url || series.cover || null,
    author: series.author_name || curated.author || 'Studio Creator',
    status: series.status || curated.status || 'Ongoing',
    rating: Number(series.rating || curated.rating || (4.5 + (hash % 5) * 0.1).toFixed(1)),
    releaseDay: series.release_day || curated.releaseDay || fallbackDay,
    genres: (series.genres && series.genres.length > 0) ? series.genres : (curated.genres || ['Action', 'Fantasy']),
    synopsis: series.description || curated.synopsis || 'Follow this thrilling manhwa series as the story unfolds chapter by chapter.',
    viewsCount: curated.viewsCount || `${(120 + (hash % 800))}K`,
    bookmarksCount: curated.bookmarksCount || `${(12 + (hash % 60))}K`,
    featured: curated.featured || false,
    chapterCount: series.chapterCount ?? (series.chapters?.[0]?.count ?? 0),
    latestChapter: series.latestChapter || null,
    chapters: series.chapters || [],
  };
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const GENRE_LIST = [
  'All',
  'Action',
  'Fantasy',
  'Supernatural',
  'Comedy',
  'Romance',
  'Sci-Fi',
  'Reincarnation',
  'System',
  'Mystery',
  'Drama',
];
