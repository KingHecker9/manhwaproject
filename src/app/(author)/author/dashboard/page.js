import { auth0 } from '../../../../../lib/auth0';
import { isAuthor } from '../../../../../lib/auth0-roles';
import AuthorDashboardForm from '../AuthorDashboardForm';

export default async function AuthorDashboardPage() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <main className="p-8 max-w-md mx-auto text-center">
        <h1 className="text-xl font-bold text-white mb-2">Sign in required</h1>
        <p className="text-sm text-neutral-500 mb-6">
          You need to log in as an author to access this page.
        </p>
        
          <a href="/auth/login?returnTo=/author/dashboard"
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

  return <AuthorDashboardForm />;
}