import { auth0 } from '@/lib/auth0';
import { isAuthor } from '@/lib/auth0-roles';
import { supabaseAdmin } from '@/lib/supabase-admin';
import AuthorDashboardForm from '../AuthorDashboardForm';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AuthorDashboardPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login?returnTo=/author/dashboard');
  }

  const authorized = await isAuthor(session.user.sub);

  if (!authorized) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <span className="text-xl font-bold">!</span>
          </div>
          <h1 className="font-serif-display text-2xl font-bold text-[var(--text-main)]">
            Creator Access Required
          </h1>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Your account ({session.user.email}) is signed in, but does not have verified author permissions yet.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              Return to Reader
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] transition-colors"
            >
              Request Author Role
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Fetch this author's existing series so they can pick from a dropdown
  const { data: existingSeries } = await supabaseAdmin
    .from("series")
    .select("id, title, slug, release_day")
    .eq("author_id", session.user.sub)
    .order("title", { ascending: true });

  return <AuthorDashboardForm existingSeries={existingSeries || []} />;
}