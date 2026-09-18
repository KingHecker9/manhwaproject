import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { isAuthor } from "@/lib/auth0-roles";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

// In-memory fallback cache for author broadcasts if DB table is unmigrated
let inMemoryBroadcasts = [
  {
    id: "notif-system-1",
    title: "Weekly Releases Live",
    message: "New chapters for Dandadan and I Contracted Myself are available now!",
    type: "system",
    link: "/#schedule",
    author_name: "Lumina Editorial",
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: "notif-system-2",
    title: "Creator Support Active",
    message: "Support independent manhwa creators directly using Buy Me a Coffee.",
    type: "announcement",
    link: "/donate",
    author_name: "Community",
    created_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
];

export async function GET() {
  try {
    // Try to fetch from Supabase notifications table if it exists
    let dbNotifications = [];
    try {
      const { data, error } = await supabaseAdmin
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && Array.isArray(data)) {
        dbNotifications = data;
      }
    } catch {
      // Table may not exist yet in Supabase schema, fall back safely
    }

    // Merge DB notifications and in-memory broadcasts (avoid duplicates by id)
    const combined = [...dbNotifications, ...inMemoryBroadcasts];
    const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15);

    return NextResponse.json({ notifications: unique });
  } catch (err) {
    console.error("Notifications GET error:", err);
    return NextResponse.json({ notifications: inMemoryBroadcasts });
  }
}

export async function POST(request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user?.sub) {
      return NextResponse.json(
        { error: "Authentication required to broadcast notifications." },
        { status: 401 }
      );
    }

    const authorized = await isAuthor(session.user.sub);
    if (!authorized) {
      return NextResponse.json(
        { error: "Author role required to broadcast announcements." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, message, link, seriesTitle, type = "announcement" } = body;

    // Restrictions to avoid spam:
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Notification title is required." },
        { status: 400 }
      );
    }

    if (title.length > 60) {
      return NextResponse.json(
        { error: "Title must be 60 characters or less." },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Notification message is required." },
        { status: 400 }
      );
    }

    if (message.length > 200) {
      return NextResponse.json(
        { error: "Message must be 200 characters or less." },
        { status: 400 }
      );
    }

    const authorName = session.user.name || session.user.nickname || "Verified Author";

    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      message: message.trim(),
      link: link || "/#latest",
      series_title: seriesTitle || null,
      author_id: session.user.sub,
      author_name: authorName,
      type,
      created_at: new Date().toISOString(),
    };

    // Try persisting to Supabase
    try {
      await supabaseAdmin.from("notifications").insert(newNotification);
    } catch (dbErr) {
      console.warn("Supabase notification insert fallback:", dbErr.message);
    }

    // Always push to in-memory store so it shows immediately across reader requests
    inMemoryBroadcasts.unshift(newNotification);
    if (inMemoryBroadcasts.length > 30) {
      inMemoryBroadcasts = inMemoryBroadcasts.slice(0, 30);
    }

    return NextResponse.json({
      success: true,
      notification: newNotification,
    });
  } catch (err) {
    console.error("Notifications POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
