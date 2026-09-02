"use client";

import Link from "next/link";
import { useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

function Avatar({ user }) {
  if (user.picture) {
    return (
      <img
        src={user.picture}
        alt={user.name || "Account"}
        className="w-8 h-8 rounded-full object-cover border border-stone-200"
      />
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xs">
      {(user.name || user.email || "?")[0].toUpperCase()}
    </div>
  );
}

export default function ReaderLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isLoading } = useUser();

  return (
    <div className="min-h-screen bg-orange-50">
      <header className="sticky top-0 z-40 bg-orange-50/95 backdrop-blur-sm border-b border-orange-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif-display text-xl font-semibold text-stone-900"
          >
            Studio Reader
          </Link>

          {/* Desktop nav + auth */}
          <div className="hidden sm:flex items-center gap-6">
            <nav className="flex gap-6 text-sm font-medium text-stone-500">
              <Link href="/" className="hover:text-rose-600 transition">
                Library
              </Link>
              <Link href="/about" className="hover:text-rose-600 transition">
                About
              </Link>
              <Link href="/donate" className="hover:text-rose-600 transition">
                Support Us
              </Link>
              <Link href="/contact" className="hover:text-rose-600 transition">
                Contact
              </Link>
            </nav>

            {!isLoading && (
              <>
                {user ? (
                  <Link href="/account">
                    <Avatar user={user} />
                  </Link>
                ) : (
                  <a
                    href="/auth/login?returnTo=/"
                    className="text-xs px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
                  >
                    Log In / Sign Up
                  </a>
                )}
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="sm:hidden p-2 rounded bg-white border border-stone-200 text-stone-600"
          >
            ☰
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-orange-200 px-6 py-4 space-y-3 bg-orange-50">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-stone-700"
            >
              Library
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-stone-700"
            >
              About
            </Link>
            <Link
              href="/donate"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-stone-700"
            >
              Support Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="block text-sm text-stone-700"
            >
              Contact
            </Link>
            {!isLoading && (
              <>
                {user ? (
                  <Link
                    href="/account"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 text-sm text-stone-700"
                  >
                    <Avatar user={user} />
                    My Account
                  </Link>
                ) : (
                  <a
                    href="/auth/login?returnTo=/"
                    className="block text-sm text-rose-600 font-semibold"
                  >
                    Log In / Sign Up
                  </a>
                )}
              </>
            )}
          </div>
        )}
      </header>

      {children}
    </div>
  );
}
