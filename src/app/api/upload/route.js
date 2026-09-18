import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { isAuthor } from "@/lib/auth0-roles";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { r2Client } from "@/lib/r2-client";
import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function POST(request) {
  try {
    // 1. Auth check server-side
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ error: "Authentication required. Please log in." }, { status: 401 });
    }
    const authorId = session.user.sub;
    const authorized = await isAuthor(authorId);
    if (!authorized) {
      return NextResponse.json({ error: "Author permissions required to publish chapters." }, { status: 403 });
    }

    // 2. Parse JSON body (files already uploaded to R2 client-side)
    const body = await request.json();
    const { series: seriesName, chapter: chapterNum, title: chapterTitle, pageKeys, coverKey } = body;

    if (!seriesName || chapterNum === undefined || !chapterTitle || !pageKeys?.length) {
      return NextResponse.json(
        { error: "Missing required fields: series title, chapter number, chapter title, and page images are required." },
        { status: 400 },
      );
    }

    const publicUrl = (key) => `${process.env.R2_PUBLIC_URL}/${key.replace(/^\//, '')}`;

    // 3. Find or create series
    const slug = seriesName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    let { data: series } = await supabaseAdmin
      .from("series")
      .select("id, slug, title")
      .eq("slug", slug)
      .maybeSingle();

    if (!series) {
      const coverUrl = coverKey ? publicUrl(coverKey) : null;

      const { data: newSeries, error: seriesError } = await supabaseAdmin
        .from("series")
        .insert({
          title: seriesName.trim(),
          slug,
          author_id: authorId,
          cover_url: coverUrl,
        })
        .select("id, slug, title")
        .single();

      if (seriesError) {
        console.error("Supabase series insert error:", seriesError);
        throw new Error(`Failed to create series: ${seriesError.message}`);
      }
      series = newSeries;
    }

    // 4. Create chapter row
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from("chapters")
      .insert({
        series_id: series.id,
        chapter_number: Number(chapterNum),
        title: chapterTitle.trim(),
      })
      .select("id, chapter_number, title")
      .single();

    if (chapterError) {
      console.error("Supabase chapter insert error:", chapterError);
      throw new Error(`Failed to create chapter: ${chapterError.message}`);
    }

    // 5. Move each page from its temp key to its final key in R2 (or keep tempKey if copy fails)
    const pageInserts = [];

    for (let i = 0; i < pageKeys.length; i++) {
      const pageNum = i + 1;
      const tempKey = pageKeys[i];
      const finalKey = `${series.id}/${chapter.id}/page-${pageNum}.jpg`;
      let resolvedKey = finalKey;

      try {
        const copySource = `${process.env.R2_BUCKET_NAME}/${tempKey.split('/').map(encodeURIComponent).join('/')}`;
        await r2Client.send(new CopyObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          CopySource: copySource,
          Key: finalKey,
        }));

        await r2Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: tempKey,
        }));
      } catch (r2Err) {
        console.warn(`R2 object move warning for page ${pageNum}:`, r2Err.message);
        // Fallback to original tempKey so chapter remains fully readable
        resolvedKey = tempKey;
      }

      pageInserts.push({
        chapter_id: chapter.id,
        page_number: pageNum,
        image_url: publicUrl(resolvedKey),
      });
    }

    const { error: pagesError } = await supabaseAdmin
      .from("pages")
      .insert(pageInserts);

    if (pagesError) {
      console.error("Supabase pages insert error:", pagesError);
      throw new Error(`Failed to save chapter pages: ${pagesError.message}`);
    }

    return NextResponse.json({
      success: true,
      seriesId: series.id,
      seriesSlug: series.slug,
      chapterId: chapter.id,
      chapterNumber: chapter.chapter_number,
      pageCount: pageInserts.length,
    });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during upload." },
      { status: 500 }
    );
  }
}