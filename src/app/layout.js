'use client';

import './globals.css';
import Link from 'next/link';
import { useState } from 'react';

function NavigationContent({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // desktop expand/collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer open/closed

  const showLabels = sidebarOpen || mobileOpen;

  return (
    <div className="bg-white text-neutral-900 min-h-screen flex antialiased">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-200 flex items-center justify-between px-4 py-3">
        <span className="font-black text-neutral-900 tracking-tight">StudioHub</span>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-600"
        >
          ☰
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 bg-white border-r border-neutral-200
          transition-all duration-300 flex flex-col justify-between w-64
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 ${sidebarOpen ? 'md:w-64' : 'md:w-20'}`}
      >
        <div>
          {/* Logo & Toggle */}
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            {showLabels && (
              <span className="font-black text-neutral-900 text-lg tracking-tight">StudioHub</span>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:inline-flex p-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-500"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-500"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-2">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 transition text-sm text-neutral-700"
            >
              <span>📚</span>
              {showLabels && <span>Library</span>}
            </Link>

            <Link
              href="/author"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-100 transition text-sm text-emerald-600"
            >
              <span>🎨</span>
              {showLabels && <span>Author Portal</span>}
            </Link>
          </nav>
        </div>

        <div className="p-3 border-t border-neutral-200">
          {showLabels && (
            <p className="text-[10px] text-neutral-400 text-center pt-2">
              Studio Platform v1.0
            </p>
          )}
        </div>
      </aside>

      {/* Main Workspace */}
      <div
        className={`flex-1 transition-all duration-300 pt-16 md:pt-0 ${
          sidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavigationContent>{children}</NavigationContent>
      </body>
    </html>
  );
}