import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { isAuthor } from "@/lib/auth0-roles";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { r2Client } from "@/lib/r2-client";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

export async function DELETE(request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isAuthor(session.user.sub);
    if (!authorized) {
      return NextResponse.json({ error: "Author permissions required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json({ error: "chapterId parameter is required" }, { status: 400 });
    }

    // 1. Verify chapter exists and retrieve series
    const { data: chapter, error: chErr } = await supabaseAdmin
      .from("chapters")
      .select("id, chapter_number, series_id, series(author_id)")
      .eq("id", chapterId)
      .single();

    if (chErr || !chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    // 2. Verify authorship (or admin)
    if (chapter.series?.author_id && chapter.series.author_id !== session.user.sub) {
      return NextResponse.json({ error: "You can only delete chapters from your own series" }, { status: 403 });
    }

    // 3. Find all pages for this chapter to clean up storage
    const { data: pages } = await supabaseAdmin
      .from("pages")
      .select("image_url")
      .eq("chapter_id", chapterId);

    // Clean up R2 objects if they reside in R2 bucket
    if (pages && pages.length > 0 && process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_URL) {
      try {
        const publicBase = process.env.R2_PUBLIC_URL.replace(/\/$/, "");
        const objectsToDelete = pages
          .map((p) => {
            if (p.image_url?.startsWith(publicBase)) {
              const key = p.image_url.slice(publicBase.length).replace(/^\//, "");
              return { Key: key };
            }
            return null;
          })
          .filter(Boolean);

        if (objectsToDelete.length > 0) {
          await r2Client.send(
            new DeleteObjectsCommand({
              Bucket: process.env.R2_BUCKET_NAME,
              Delete: { Objects: objectsToDelete },
            })
          );
        }
      } catch (r2Err) {
        console.warn("Storage cleanup warning during chapter deletion:", r2Err.message);
      }
    }

    // 4. Delete pages and reading_history associated with this chapter
    await supabaseAdmin.from("pages").delete().eq("chapter_id", chapterId);
    await supabaseAdmin.from("reading_history").delete().eq("chapter_id", chapterId);

    // 5. Delete chapter row
    const { error: delErr } = await supabaseAdmin
      .from("chapters")
      .delete()
      .eq("id", chapterId);

    if (delErr) {
      throw new Error(`Failed to delete chapter: ${delErr.message}`);
    }

    return NextResponse.json({ success: true, deletedChapterId: chapterId });
  } catch (err) {
    console.error("Delete chapter error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to delete chapter" },
      { status: 500 }
    );
  }
}
