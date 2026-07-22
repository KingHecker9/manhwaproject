'use client';

import './globals.css';
import Link from 'next/link';
import { useState } from 'react';
import { Auth0Provider, useUser } from '@auth0/nextjs-auth0/client';

function NavigationContent({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, isLoading } = useUser();

  return (
    <div className="bg-neutral-950 text-neutral-100 min-h-screen flex antialiased">
      {/* Vertical Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-neutral-900 border-r border-neutral-800 transition-all duration-300 flex flex-col justify-between fixed h-full z-40`}
      >
        <div>
          {/* Logo & Toggle */}
          <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
            {sidebarOpen && <span className="font-bold text-blue-500 text-lg">StudioHub</span>}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300"
            >
              {sidebarOpen ? '←' : '→'}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 transition text-sm"
            >
              <span>📚</span>
              {sidebarOpen && <span>Library</span>}
            </Link>

            <Link
              href="/author"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 transition text-sm text-blue-400"
            >
              <span>✍️</span>
              {sidebarOpen && <span>Author Portal</span>}
            </Link>

            <Link
              href="/donate"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 transition text-sm text-yellow-400"
            >
              <span>🪙</span>
              {sidebarOpen && <span>Support / Donate</span>}
            </Link>
          </nav>
        </div>

        {/* Auth Section at Bottom of Sidebar */}
        <div className="p-3 border-t border-neutral-800 space-y-2">
          {!isLoading && (
            <>
              {user ? (
                /* Displayed when logged in */
                <div className="space-y-2">
                  {sidebarOpen && (
                    <div className="px-2 text-xs text-neutral-400 truncate">
                      👤 {user.name || user.email}
                    </div>
                  )}
                  <a
                    href="/auth/logout"
                    className="flex items-center justify-center gap-2 w-full p-2.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <span>🚪</span>
                    {sidebarOpen && <span>Log Out</span>}
                  </a>
                </div>
              ) : (
                /* Displayed when logged out */
                <a
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 w-full p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <span>🔑</span>
                  {sidebarOpen && <span>Author Login</span>}
                </a>
              )}
            </>
          )}

          {sidebarOpen && (
            <p className="text-[10px] text-neutral-600 text-center pt-2">
              Studio Platform v1.0
            </p>
          )}
        </div>
      </aside>

      {/* Main Workspace */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {children}
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider>
          <NavigationContent>{children}</NavigationContent>
        </Auth0Provider>
      </body>
    </html>
  );
}