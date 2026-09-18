import { auth0 } from '@/lib/auth0';
import { isAuthor } from '@/lib/auth0-roles';
import { supabaseAdmin } from '@/lib/supabase-admin';
import AccountClient from './AccountClient';

export default async function AccountPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full mx-auto text-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-10 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-xs">
            <span className="text-2xl font-serif-display font-bold">R</span>
          </div>
          <h1 className="font-serif-display text-2xl font-bold text-[var(--text-main)]">
            Sign In Required
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Log in to view your reading profile, track completed chapters, access your saved shelf, and configure reader preferences.
          </p>

          <div className="pt-2">
            <a
              href="/auth/login?returnTo=/account"
              className="inline-flex items-center justify-center w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
            >
              Log In / Sign Up
            </a>
          </div>
        </div>
      </main>
    );
  }

  const authorized = await isAuthor(session.user.sub);

  // Fetch real reader reading history
  let readingRows = [];
  try {
    const { data } = await supabaseAdmin
      .from("reading_history")
      .select("chapter_id, series_id, read_at, chapters(chapter_number, title), series(title, slug, cover_url)")
      .eq("user_id", session.user.sub)
      .order("read_at", { ascending: false });

    readingRows = data || [];
  } catch (err) {
    console.warn("Could not fetch reading history:", err.message);
  }

  return (
    <AccountClient
      user={session.user}
      authorized={authorized}
      readingRows={readingRows}
    />
  );
}