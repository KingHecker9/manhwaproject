'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { BookOpen, Menu, X, ArrowLeft, LogOut, Upload, Library } from 'lucide-react';

export default function AuthorLayout({ children }) {
  const { user, isLoading } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Mobile Top Bar */}
      <div className="sm:hidden flex items-center justify-between p-4 border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-indigo-400 font-semibold">
            Creator Studio
          </p>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          type="button"
          aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
          className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="sm:hidden border-b border-neutral-800 p-4 space-y-3 bg-neutral-950">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Library</span>
          </Link>
          {!isLoading && user && (
            <div className="space-y-2 pt-2 border-t border-neutral-800">
              <p className="text-xs text-neutral-500 truncate">{user.name || user.email}</p>
              <a
                href="/auth/logout"
                className="flex items-center justify-center gap-2 text-xs px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </a>
            </div>
          )}
        </div>
      )}

      <div className="sm:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden sm:flex w-64 bg-neutral-950 border-r border-neutral-800/80 flex-col justify-between fixed h-full p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <BookOpen className="w-4 h-4" strokeWidth={2} />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-[0.2em] text-indigo-400 font-bold">
                  Creator Studio
                </p>
                <p className="text-[10px] text-neutral-500 font-medium">Author Management</p>
              </div>
            </div>

            <nav className="space-y-1 pt-2">
              <Link
                href="/author"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 text-xs font-semibold"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Chapters</span>
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-900 text-xs font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Reader</span>
              </Link>
            </nav>
          </div>

          <div className="pt-4 border-t border-neutral-800/80">
            {!isLoading && user && (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-indigo-950 flex items-center justify-center text-indigo-400 text-xs font-bold ring-2 ring-indigo-500/20">
                    {(user.name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate">{user.name || 'Author'}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
                  </div>
                </div>

                <a
                  href="/auth/logout"
                  className="flex items-center justify-center gap-2 text-center text-xs px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-rose-400 rounded-xl transition-colors border border-neutral-800"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </a>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1 sm:ml-64">{children}</div>
      </div>
    </div>
  );
}
