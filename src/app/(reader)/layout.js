'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

function AuthChoiceModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center px-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6"
      >
        <h2 className="text-lg font-bold text-stone-900 mb-1">Continue as...</h2>
        <p className="text-sm text-stone-500 mb-6">Choose how you want to use Studio Reader.</p>

        <div className="space-y-3">
          
            <a href="/auth/login?returnTo=/"
            className="flex items-center gap-3 p-4 rounded-lg border border-stone-200 hover:border-rose-400 hover:bg-rose-50 transition"
          >
            <span className="text-2xl">📖</span>
            <div>
              <p className="font-semibold text-sm text-stone-900">Reader</p>
              <p className="text-xs text-stone-500">Read manhwa, save your history</p>
            </div>
          </a>

          
           <a href="/auth/login?returnTo=/author"
            className="flex items-center gap-3 p-4 rounded-lg border border-stone-200 hover:border-rose-400 hover:bg-rose-50 transition"
          >
            <span className="text-2xl">🎨</span>
            <div>
              <p className="font-semibold text-sm text-stone-900">Author / Mangaka</p>
              <p className="text-xs text-stone-500">Upload and manage your chapters</p>
            </div>
          </a>
        </div>

        <button onClick={onClose} className="mt-5 w-full text-xs text-stone-400 hover:text-stone-600">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function ReaderLayout({ children }) {
  const [showAuthChoice, setShowAuthChoice] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthorRole, setIsAuthorRole] = useState(false);
  const [roleLoading, setRoleLoading] = useState(true);
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      setIsAuthorRole(false);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    fetch('/api/me/role')
      .then((res) => res.json())
      .then((data) => setIsAuthorRole(data.isAuthor))
      .catch(() => setIsAuthorRole(false))
      .finally(() => setRoleLoading(false));
  }, [user, isLoading]);

  return (
    <div className="min-h-screen bg-orange-50">
      {showAuthChoice && <AuthChoiceModal onClose={() => setShowAuthChoice(false)} />}

      <header className="sticky top-0 z-40 bg-orange-50/95 backdrop-blur-sm border-b border-orange-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-serif-display text-xl font-semibold text-stone-900">
            Studio Reader
          </Link>

          {/* Desktop nav + auth */}
          <div className="hidden sm:flex items-center gap-6">
            <nav className="flex gap-6 text-sm font-medium text-stone-500">
              <Link href="/" className="hover:text-rose-600 transition">Library</Link>
              {!roleLoading && isAuthorRole && (
                <Link href="/author" className="hover:text-rose-600 transition">Author Portal</Link>
              )}
            </nav>

            {!isLoading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-500">{user.name || user.email}</span>
                    
                      <a href="/auth/logout"
                      className="text-xs px-3 py-1.5 rounded-full bg-white border border-stone-200 hover:border-rose-400 text-stone-600 transition"
                    >
                      Log Out
                    </a>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthChoice(true)}
                    className="text-xs px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold transition"
                  >
                    Log In / Sign Up
                  </button>
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
            <Link href="/" onClick={() => setMobileOpen(false)} className="block text-sm text-stone-700">
              Library
            </Link>
            {!roleLoading && isAuthorRole && (
              <Link href="/author" onClick={() => setMobileOpen(false)} className="block text-sm text-stone-700">
                Author Portal
              </Link>
            )}
            {!isLoading && (
              <>
                {user ? (
                  <a href="/auth/logout" className="block text-sm text-rose-600">Log Out</a>
                ) : (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      setShowAuthChoice(true);
                    }}
                    className="text-sm text-rose-600 font-semibold"
                  >
                    Log In / Sign Up
                  </button>
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