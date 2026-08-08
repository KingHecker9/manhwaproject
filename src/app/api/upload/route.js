import { NextResponse } from "next/server";
import { auth0 } from "../../../lib/auth0";
import { isAuthor } from "../../../lib/auth0-roles";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export async function POST(request) {
  try {
    // 1. Auth check server-side
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    const authorId = session.user.sub;
    const authorized = await isAuthor(authorId);
    if (!authorized) {
      return NextResponse.json({ error: "Not an author" }, { status: 403 });
    }

    // 2. Parse form
    const formData = await request.formData();
    const seriesName = formData.get("series");
    const chapterNum = formData.get("chapter");
    const chapterTitle = formData.get("title");
    const pagePathsRaw = formData.get("pagePaths"); // JSON array of Storage paths, already uploaded client-side
    const coverFile = formData.get("cover"); // optional

    if (!seriesName || !chapterNum || !chapterTitle || !pagePathsRaw) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const pagePaths = JSON.parse(pagePathsRaw);

    // 3. Find or create series
    const slug = seriesName.toLowerCase().trim().replace(/\s+/g, "-");

    let { data: series } = await supabaseAdmin
      .from("series")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!series) {
      let coverUrl = null;

      if (coverFile) {
        const coverExt = coverFile.name.split(".").pop();
        const coverPath = `covers/${slug}.${coverExt}`;
        const coverBuffer = Buffer.from(await coverFile.arrayBuffer());

        const { error: coverUploadError } = await supabaseAdmin.storage
          .from("manhwa-pages")
          .upload(coverPath, coverBuffer, {
            contentType: coverFile.type,
            upsert: true,
          });
        if (coverUploadError) throw coverUploadError;

        const { data: coverUrlData } = supabaseAdmin.storage
          .from("manhwa-pages")
          .getPublicUrl(coverPath);
        coverUrl = coverUrlData.publicUrl;
      }

      const { data: newSeries, error: seriesError } = await supabaseAdmin
        .from("series")
        .insert({ title: seriesName, slug, author_id: authorId, cover_url: coverUrl })
        .select("id")
        .single();
      if (seriesError) throw seriesError;
      series = newSeries;
    }

    // 4. Create chapter row
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from("chapters")
      .insert({
        series_id: series.id,
        chapter_number: Number(chapterNum),
        title: chapterTitle,
      })
      .select("id")
      .single();
    if (chapterError) throw chapterError;

    // 5. Move each already-uploaded page from temp-pages/ to its final path, insert DB rows
    const pageInserts = [];

    for (let i = 0; i < pagePaths.length; i++) {
      const pageNum = i + 1;
      const tempPath = pagePaths[i];
      const finalPath = `${series.id}/${chapter.id}/page-${pageNum}.jpg`;

      const { error: moveError } = await supabaseAdmin.storage
        .from("manhwa-pages")
        .move(tempPath, finalPath);
      if (moveError) throw moveError;

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("manhwa-pages")
        .getPublicUrl(finalPath);

      pageInserts.push({
        chapter_id: chapter.id,
        page_number: pageNum,
        image_url: publicUrlData.publicUrl,
      });
    }

    const { error: pagesError } = await supabaseAdmin
      .from("pages")
      .insert(pageInserts);
    if (pagesError) throw pagesError;

    return NextResponse.json({
      success: true,
      seriesId: series.id,
      chapterId: chapter.id,
      pageCount: pageInserts.length,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}