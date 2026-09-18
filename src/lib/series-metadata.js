/**
 * Realtime Metadata enrichment helper for Manhwa Series.
 * Always prioritizes realtime database metrics. No dummy random numbers.
 */

// Authentic information for known titles (official synopses and genres)
const AUTHENTIC_SERIES_INFO = {
  'dandadan': {
    title: 'Dandadan',
    alternativeTitle: 'ダンダダン / Dan Da Dan',
    author: 'Yukinobu Tatsu',
    status: 'Ongoing',
    genres: ['Action', 'Comedy', 'Supernatural', 'Sci-Fi', 'Romance'],
    synopsis:
      'Momo Ayase strikes up an unusual friendship with her school’s UFO fanatic, whom she nicknames "Okarun". While Momo believes in ghosts, she considers aliens nonsense. Her new friend thinks the opposite. To settle their bet, the two visit separate paranormal hotspots and find out that both ghosts and aliens exist in the wildest ways possible!',
    bannerUrl: 'https://jvcnrfmqjnruclesovby.supabase.co/storage/v1/object/public/manhwa-pages/Dandadan.jpg',
  },
  'i-contracted-myself': {
    title: 'I Contracted Myself',
    alternativeTitle: '나 자신과 계약했다 / Contract with Myself',
    author: 'Studio Redice',
    status: 'Ongoing',
    genres: ['Action', 'Fantasy', 'Reincarnation', 'System'],
    synopsis:
      'In a world where awakeners sign contracts with constellations and spirits, a hunter who was betrayed at the lowest tier discovers a soul-binding contract system with only one eligible partner: his future transcended self. With double the skills and knowledge of the future, he begins his ascent.',
    bannerUrl: 'https://pub-93430bb912754abc8e23166862ad4fc1.r2.dev/covers/i-contracted-myself.jpg',
  }
};

export function enrichSeries(series) {
  if (!series) return null;
  const slug = series.slug || (series.title ? series.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
  const info = AUTHENTIC_SERIES_INFO[slug] || {};

  // Calculate real release day from the latest chapter's created_at timestamp if available
  let calculatedReleaseDay = series.release_day || null;
  if (!calculatedReleaseDay && series.latestChapterCreatedAt) {
    try {
      calculatedReleaseDay = new Date(series.latestChapterCreatedAt).toLocaleDateString('en-US', { weekday: 'long' });
    } catch {
      calculatedReleaseDay = null;
    }
  }

  // Real chapter count
  const chapterCount = Number(series.chapterCount ?? (series.chapters?.[0]?.count ?? series.chapters?.length ?? 0));

  // Real view count formatted cleanly (e.g. 52 -> "52", 1400 -> "1.4K")
  let viewsFormatted = null;
  if (typeof series.viewsCount === 'number') {
    if (series.viewsCount >= 1000000) {
      viewsFormatted = `${(series.viewsCount / 1000000).toFixed(1)}M`;
    } else if (series.viewsCount >= 1000) {
      viewsFormatted = `${(series.viewsCount / 1000).toFixed(1)}K`;
    } else {
      viewsFormatted = `${series.viewsCount}`;
    }
  }

  return {
    id: series.id,
    slug: series.slug || slug,
    title: series.title || info.title || 'Untitled Series',
    alternativeTitle: series.alternative_title || info.alternativeTitle || '',
    cover: series.cover_url || series.cover || info.bannerUrl || null,
    banner: series.cover_url || series.cover || info.bannerUrl || null,
    author: series.author_name || info.author || 'Independent Creator',
    status: series.status || info.status || 'Ongoing',
    // Real rating only if supplied by database/user review; otherwise null
    rating: series.rating ? Number(series.rating) : null,
    releaseDay: calculatedReleaseDay || 'Weekly',
    genres: (series.genres && series.genres.length > 0) ? series.genres : (info.genres || ['Action', 'Webtoon']),
    synopsis: series.description || info.synopsis || 'Read this manhwa series on Studio Reader with high-definition vertical scrolling.',
    viewsCount: viewsFormatted,
    rawViewsCount: typeof series.viewsCount === 'number' ? series.viewsCount : 0,
    bookmarksCount: series.bookmarksCount ?? null,
    featured: series.featured ?? false,
    chapterCount,
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
