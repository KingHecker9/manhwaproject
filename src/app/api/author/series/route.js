import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { isAuthor } from "@/lib/auth0-roles";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isAuthor(session.user.sub);
    if (!authorized) {
      return NextResponse.json({ error: "Author access required" }, { status: 403 });
    }

    // Fetch author's series with full chapters list and counts
    const { data: seriesList, error: sErr } = await supabaseAdmin
      .from("series")
      .select(`
        id,
        title,
        slug,
        cover_url,
        release_day,
        created_at,
        chapters(id, chapter_number, title, created_at)
      `)
      .eq("author_id", session.user.sub)
      .order("title", { ascending: true });

    if (sErr) throw sErr;

    // Fetch reads per series
    const seriesIds = (seriesList || []).map((s) => s.id);
    const viewsMap = {};

    if (seriesIds.length > 0) {
      const { data: reads } = await supabaseAdmin
        .from("reading_history")
        .select("series_id");

      if (reads) {
        reads.forEach((r) => {
          if (r.series_id) {
            viewsMap[r.series_id] = (viewsMap[r.series_id] || 0) + 1;
          }
        });
      }
    }

    const formatted = (seriesList || []).map((s) => ({
      ...s,
      chapterCount: s.chapters?.length || 0,
      viewsCount: viewsMap[s.id] || 0,
    }));

    return NextResponse.json({ series: formatted });
  } catch (err) {
    console.error("Author series fetch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = await isAuthor(session.user.sub);
    if (!authorized) {
      return NextResponse.json({ error: "Author access required" }, { status: 403 });
    }

    const body = await request.json();
    const { seriesId, releaseDay } = body;

    if (!seriesId) {
      return NextResponse.json({ error: "Series ID is required" }, { status: 400 });
    }

    const updates = {};
    if (releaseDay) updates.release_day = releaseDay;

    const { data, error } = await supabaseAdmin
      .from("series")
      .update(updates)
      .eq("id", seriesId)
      .eq("author_id", session.user.sub)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, series: data });
  } catch (err) {
    console.error("Author series update error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

