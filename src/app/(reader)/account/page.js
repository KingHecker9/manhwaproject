import { auth0 } from '../../../lib/auth0';
import { isAuthor } from '../../../lib/auth0-roles';
import Link from 'next/link';
import { BookOpen, Library, FileText, Eye, Camera } from 'lucide-react';

function StatCard({ icon: Icon, value, label, rotate }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-stone-100 px-5 py-4 flex flex-col items-center min-w-[100px] ${rotate}`}
    >
      <Icon className="w-6 h-6 text-rose-500 mb-1" strokeWidth={1.75} />
      <p className="text-lg font-bold text-stone-900">{value}</p>
      <p className="text-xs text-stone-500 text-center">{label}</p>
    </div>
  );
}

export default async function AccountPage() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <main className="min-h-screen bg-orange-50 p-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-xl font-bold text-stone-900 mb-2">Sign in required</h1>
          <p className="text-sm text-stone-500 mb-6">
            You need to log in to view your account.
          </p>
          
           <a href="/auth/login?returnTo=/"
            className="inline-block px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-sm font-semibold"
          >
            Log In
          </a>
        </div>
      </main>
    );
  }

  const authorized = await isAuthor(session.user.sub);

  // TODO: replace with real counts once reading_history / views tracking exists
  const readerStats = [
    { icon: BookOpen, value: 12, label: "Chapters Read" },
    { icon: Library, value: 3, label: "Series Followed" },
  ];

  // TODO: replace with real Supabase counts + a real reads/views aggregate
  const authorStats = [
    { icon: Library, value: 1, label: "Series Published" },
    { icon: FileText, value: 5, label: "Chapters Uploaded" },
    { icon: Eye, value: 128, label: "Total Reads" },
  ];

  const stats = authorized ? authorStats : readerStats;
  const rotations = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

  return (
    <main className="min-h-screen bg-orange-50 py-12 px-6">
      <div className="max-w-lg mx-auto bg-white rounded-3xl shadow-xl border border-stone-100 px-6 py-10">
        {/* Avatar */}
        <div className="flex justify-center">
          <div className="relative">
            {session.user.picture ? (
              <img
                src={session.user.picture}
                alt={session.user.name || "Profile"}
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-rose-100 border-4 border-white shadow-md flex items-center justify-center text-rose-600 font-bold text-3xl">
                {(session.user.name || session.user.email || "?")[0].toUpperCase()}
              </div>
            )}
            {/* TODO: wire up profile picture upload */}
            <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-white border border-stone-200 shadow flex items-center justify-center hover:bg-stone-50 transition">
              <Camera className="w-4 h-4 text-stone-600" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Name + email, centered */}
        <div className="text-center mt-3">
          <h1 className="font-serif-display text-xl font-semibold text-stone-900">
            {session.user.name || "—"}
          </h1>
          <p className="text-sm text-stone-500">{session.user.email}</p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full bg-orange-50 border border-stone-200 text-xs font-medium text-stone-600">
            {authorized ? "Author" : "Reader"}
          </span>
        </div>

        {/* Floating stat cards */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              rotate={rotations[i % rotations.length]}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="mt-10 space-y-3 max-w-sm mx-auto">
          {authorized && (
            <Link
              href="/author"
              className="block w-full text-center py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm transition"
            >
              Go to Author Portal
            </Link>
          )}

          
           <a href="/auth/logout"
            className="block w-full text-center py-2.5 rounded-full bg-orange-50 border border-stone-200 hover:border-rose-400 text-stone-600 text-sm transition"
          >
            Log Out
          </a>
        </div>
      </div>
    </main>
  );
}