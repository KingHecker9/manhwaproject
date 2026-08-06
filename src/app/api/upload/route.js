import { NextResponse } from "next/server";
import { auth0 } from "../../../lib/auth0";
import { isAuthor } from "../../../lib/auth0-roles";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { pdfToPng } from "pdf-to-png-converter";

export async function POST(request) {
  try {
    // 1. Auth check server-side (form doesn't send authorId)
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
    const pdfFile = formData.get("pdf");

    if (!seriesName || !chapterNum || !chapterTitle || !pdfFile) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 3. Find or create series
    const slug = seriesName.toLowerCase().trim().replace(/\s+/g, "-");

    let { data: series } = await supabaseAdmin
      .from("series")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!series) {
      const { data: newSeries, error: seriesError } = await supabaseAdmin
        .from("series")
        .insert({ title: seriesName, slug, author_id: authorId })
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

    // 5. Rasterize PDF pages to PNG buffers
    const pdfBytes = Buffer.from(await pdfFile.arrayBuffer());

    const pngPages = await pdfToPng(pdfBytes, {
      viewportScale: 2.0,
    });

    const pageInserts = [];

    for (let i = 0; i < pngPages.length; i++) {
      const pageNum = i + 1;
      const filePath = `${series.id}/${chapter.id}/page-${pageNum}.png`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("manhwa-pages")
        .upload(filePath, pngPages[i].content, {
          contentType: "image/png",
          upsert: true,
        });
      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabaseAdmin.storage
        .from("manhwa-pages")
        .getPublicUrl(filePath);

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