import { auth0 } from '../../../lib/auth0';
import { isAuthor } from '../../../lib/auth0-roles';
import Link from 'next/link';

export default async function AuthorAccountPage() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <main className="p-8 max-w-md mx-auto text-center">
        <h1 className="text-xl font-bold text-white mb-2">Sign in required</h1>
        <p className="text-sm text-neutral-500 mb-6">
          You need to log in as an author to access this page.
        </p>
        
          <a href="/auth/login?returnTo=/author"
          className="inline-block px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold"
        >
          Log In
        </a>
      </main>
    );
  }

  const authorized = await isAuthor(session.user.sub);

  if (!authorized) {
    return (
      <main className="p-8 max-w-md mx-auto text-center">
        <h1 className="text-xl font-bold text-white mb-2">Author access required</h1>
        <p className="text-sm text-neutral-500">
          Your account ({session.user.email}) doesn&apos;t have author permissions yet.
          Contact the site owner if you believe this is a mistake.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-lg mx-auto">
        <header className="mb-8 border-b border-neutral-800 pb-4">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-indigo-400 mb-2">
            Creator Studio
          </p>
          <h1 className="text-2xl font-bold text-white">My Account</h1>
        </header>

        <div className="bg-neutral-900 border border-neutral-800 p-6 space-y-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-neutral-500 mb-1">
              Name
            </p>
            <p className="text-sm text-white">{session.user.name || "—"}</p>
          </div>

          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-neutral-500 mb-1">
              Email
            </p>
            <p className="text-sm text-white">{session.user.email}</p>
          </div>

          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-neutral-500 mb-1">
              Role
            </p>
            <p className="text-sm text-white">Author</p>
          </div>

          <div className="pt-4 border-t border-neutral-800 space-y-3">
            <Link
              href="/author/dashboard"
              className="block w-full text-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition"
            >
              Go to Author Portal
            </Link>

            
              <a href="/auth/logout"
              className="block w-full text-center py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm transition"
            >
              Log Out
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}