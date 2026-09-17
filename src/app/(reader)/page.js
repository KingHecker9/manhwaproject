import { supabaseAdmin } from "../../lib/supabase-admin";
import { enrichSeries } from "../../lib/series-metadata";
import CatalogClient from "./CatalogClient";

export const revalidate = 60;

export default async function CatalogPage() {
  // Fetch series with chapters count
  const { data: seriesList, error: seriesError } = await supabaseAdmin
    .from("series")
    .select("id, slug, title, cover_url, created_at, chapters(count)");

  if (seriesError) {
    console.error("Error fetching series in CatalogPage:", seriesError);
  }

  // Format and enrich each series with rich metadata
  const formatted = (seriesList || []).map((s) => {
    const chapterCount = s.chapters?.[0]?.count ?? 0;
    return enrichSeries({
      id: s.slug,
      slug: s.slug,
      title: s.title,
      cover_url: s.cover_url,
      cover: s.cover_url,
      chapterCount,
    });
  });

  return <CatalogClient seriesList={formatted} />;
}