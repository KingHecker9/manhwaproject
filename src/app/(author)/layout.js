"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function AuthorLayout({ children }) {
  const { user, isLoading } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Mobile top bar */}
      <div className="sm:hidden flex items-center justify-between p-4 border-b border-neutral-800">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-indigo-400">
          Creator Studio
        </p>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-400"
        >
          ☰
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="sm:hidden border-b border-neutral-800 p-4 space-y-3 bg-neutral-950">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-neutral-400 hover:text-white transition"
          >
            ← Back to Library
          </Link>
          {!isLoading && user && (
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <p className="text-xs text-neutral-500 truncate">
                {user.name || user.email}
              </p>

              <a
                href="/auth/logout"
                className="block text-center text-xs px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 rounded"
              >
                Log Out
              </a>
            </div>
          )}
        </div>
      )}

      <div className="sm:flex">
        {/* Desktop sidebar */}
        <aside className="hidden sm:flex w-56 bg-neutral-950 border-r border-neutral-800 flex-col justify-between fixed h-full">
          <div className="p-4">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-indigo-400 mb-6">
              Creator Studio
            </p>
            <Link
              href="/"
              className="text-sm text-neutral-400 hover:text-white transition"
            >
              ← Back to Library
            </Link>
          </div>

          <div className="p-4 border-t border-neutral-800">
            {!isLoading && user && (
              <div className="space-y-2">
                <p className="text-xs text-neutral-500 truncate">
                  {user.name || user.email}
                </p>

                <a
                  href="/auth/logout"
                  className="block text-center text-xs px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 rounded"
                >
                  Log Out
                </a>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 sm:ml-56">{children}</div>
      </div>
    </div>
  );
}
