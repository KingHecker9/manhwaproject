import { supabaseAdmin } from "../../lib/supabase-admin";
import CatalogClient from './CatalogClient';

export const revalidate = 60;

export default async function CatalogPage() {
  const { data: seriesList } = await supabaseAdmin
    .from("series")
    .select("id, slug, title, cover_url, chapters(count)");

  const formatted = (seriesList || []).map((s) => ({
    id: s.slug,
    slug: s.slug,
    title: s.title,
    cover: s.cover_url,
    chapterCount: s.chapters?.[0]?.count ?? 0,
  }));

  return <CatalogClient seriesList={formatted} />;
}