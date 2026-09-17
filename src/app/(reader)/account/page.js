/* eslint-disable @next/next/no-img-element */
import { auth0 } from '../../../lib/auth0';
import { isAuthor } from '../../../lib/auth0-roles';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import Link from 'next/link';
import { BookOpen, Library, FileText, Eye, Camera, Clock, Sparkles, LogOut, ChevronRight } from 'lucide-react';

function StatCard({ icon: Icon, value, label }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-2xl shadow-xs border border-[var(--border-subtle)] px-6 py-5 flex flex-col items-center min-w-[120px] transition-all hover:border-indigo-500/40">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
        <Icon className="w-5 h-5" strokeWidth={1.75} />
      </div>
      <p className="text-2xl font-bold text-[var(--text-main)]">{value}</p>
      <p className="text-xs text-[var(--text-secondary)] text-center mt-0.5">{label}</p>
    </div>
  );
}

export default async function AccountPage() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-8">
        <div className="max-w-md w-full mx-auto text-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6" strokeWidth={2} />
          </div>
          <h1 className="font-serif-display text-2xl font-bold text-[var(--text-main)] mb-2">
            Sign In Required
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mb-6">
            Log in to view your reading profile, track completed chapters, and access your library.
          </p>

          <a
            href="/auth/login?returnTo=/account"
            className="inline-flex items-center justify-center w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            Log In / Sign Up
          </a>
        </div>
      </main>
    );
  }

  const authorized = await isAuthor(session.user.sub);

  // Real reader stats pulled from reading_history
  const { data: readingRows } = await supabaseAdmin
    .from("reading_history")
    .select("chapter_id, series_id, read_at, chapters(chapter_number, title), series(title, slug, cover_url)")
    .eq("user_id", session.user.sub)
    .order("read_at", { ascending: false });

  const chaptersReadCount = readingRows?.length ?? 0;
  const seriesFollowedCount = new Set(readingRows?.map((r) => r.series_id)).size;

  const readerStats = [
    { icon: BookOpen, value: chaptersReadCount, label: "Chapters Read" },
    { icon: Library, value: seriesFollowedCount, label: "Series Followed" },
    { icon: Sparkles, value: "Active", label: "Reader Status" },
  ];

  const authorStats = [
    { icon: Library, value: 1, label: "Series Published" },
    { icon: FileText, value: 5, label: "Chapters Uploaded" },
    { icon: Eye, value: "1.2K", label: "Total Reads" },
  ];

  const stats = authorized ? authorStats : readerStats;

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Profile Card Container */}
      <div className="bg-[var(--bg-card)] rounded-3xl shadow-sm border border-[var(--border-subtle)] px-6 sm:px-10 py-10">
        {/* Avatar & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {session.user.picture ? (
              <img
                src={session.user.picture}
                alt={session.user.name || "Profile"}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-500/20 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-950/70 ring-4 ring-indigo-500/20 shadow-md flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-3xl">
                {(session.user.name || session.user.email || "?")[0].toUpperCase()}
              </div>
            )}
            <button
              type="button"
              aria-label="Edit Profile Picture"
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow flex items-center justify-center hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-[var(--text-secondary)]" strokeWidth={1.75} />
            </button>
          </div>

          <h1 className="font-serif-display text-2xl font-bold text-[var(--text-main)] mt-4">
            {session.user.name || "Reader"}
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{session.user.email}</p>

          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            {authorized ? "Creator / Author" : "Verified Reader"}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </div>

        {/* Recent Reading History */}
        {readingRows && readingRows.length > 0 && (
          <div className="mt-12 pt-8 border-t border-[var(--border-subtle)]">
            <h2 className="font-serif-display text-lg font-bold text-[var(--text-main)] mb-4">
              Recently Read
            </h2>
            <div className="space-y-2">
              {readingRows.slice(0, 5).map((row, idx) => (
                <Link
                  key={idx}
                  href={`/reader/${row.series?.slug || row.series_id}/${row.chapters?.chapter_number || 1}`}
                  className="flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                      {row.chapters?.chapter_number || 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-main)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {row.series?.title || 'Series'} — Chapter {row.chapters?.chapter_number}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>
                          {row.read_at ? new Date(row.read_at).toLocaleDateString() : 'Recently'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-10 space-y-3 max-w-sm mx-auto">
          {authorized && (
            <Link
              href="/author"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition-all"
            >
              <Library className="w-4 h-4" />
              <span>Go to Creator Studio</span>
            </Link>
          )}

          <a
            href="/auth/logout"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-rose-500/50 text-[var(--text-secondary)] hover:text-rose-600 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </a>
        </div>
      </div>
    </main>
  );
}