import { NextResponse } from "next/server";
import { auth0 } from "../../../lib/auth0";
import { isAuthor } from "../../../lib/auth0-roles";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { r2Client } from "../../../lib/r2-client";
import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

    // 2. Parse JSON body (files already uploaded to R2 client-side)
    const { series: seriesName, chapter: chapterNum, title: chapterTitle, pageKeys, coverKey } =
      await request.json();

    if (!seriesName || !chapterNum || !chapterTitle || !pageKeys?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const publicUrl = (key) => `${process.env.R2_PUBLIC_URL}/${key}`;

    // 3. Find or create series
    const slug = seriesName.toLowerCase().trim().replace(/\s+/g, "-");

    let { data: series } = await supabaseAdmin
      .from("series")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!series) {
      const coverUrl = coverKey ? publicUrl(coverKey) : null;

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

    // 5. Move each page from its temp key to its final key (R2 has no "move" — copy then delete)
    const pageInserts = [];

    for (let i = 0; i < pageKeys.length; i++) {
      const pageNum = i + 1;
      const tempKey = pageKeys[i];
      const finalKey = `${series.id}/${chapter.id}/page-${pageNum}.jpg`;

      await r2Client.send(new CopyObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        CopySource: `${process.env.R2_BUCKET_NAME}/${tempKey}`,
        Key: finalKey,
      }));

      await r2Client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: tempKey,
      }));

      pageInserts.push({
        chapter_id: chapter.id,
        page_number: pageNum,
        image_url: publicUrl(finalKey),
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