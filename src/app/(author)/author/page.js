import { auth0 } from '../../../lib/auth0';
import { isAuthor } from '../../../lib/auth0-roles';
import { redirect } from 'next/navigation';

export default async function AuthorPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect('/auth/login?returnTo=/author');
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

  redirect('/author/dashboard');
}