import { supabaseAdmin } from '@/lib/supabase-admin';

export const revalidate = 3600; // Revalidate sitemap hourly

export default async function sitemap() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://manhwaproject.vercel.app';

  // 1. Static Core Pages
  const staticRoutes = [
    {
      url: `${siteUrl}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/donate`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 2. Dynamic Series and Chapters Pages from Supabase
  let dynamicRoutes = [];

  try {
    const { data: seriesList, error } = await supabaseAdmin
      .from('series')
      .select('id, slug, updated_at, created_at, chapters(chapter_number, created_at)');

    if (!error && seriesList && seriesList.length > 0) {
      seriesList.forEach((s) => {
        const seriesSlug = s.slug || s.id;
        const lastMod = s.updated_at || s.created_at || new Date().toISOString();

        // Series overview page
        dynamicRoutes.push({
          url: `${siteUrl}/series/${seriesSlug}`,
          lastModified: lastMod,
          changeFrequency: 'daily',
          priority: 0.9,
        });

        // Individual reader chapter pages
        (s.chapters || []).forEach((ch) => {
          if (ch.chapter_number) {
            dynamicRoutes.push({
              url: `${siteUrl}/reader/${seriesSlug}/${ch.chapter_number}`,
              lastModified: ch.created_at || lastMod,
              changeFrequency: 'weekly',
              priority: 0.8,
            });
          }
        });
      });
    }
  } catch (err) {
    console.warn('Could not generate dynamic sitemap routes:', err?.message || err);
  }

  return [...staticRoutes, ...dynamicRoutes];
}
