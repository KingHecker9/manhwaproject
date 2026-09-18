'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import {
  Compass,
  Calendar,
  Search,
  BookOpen,
  User,
  Sparkles,
} from 'lucide-react';

export default function MobileBottomNav({ onOpenSearch }) {
  const pathname = usePathname();
  const { user } = useUser();

  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    const updateHash = () => {
      if (typeof window !== 'undefined') {
        setCurrentHash(window.location.hash);
      }
    };
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  // Hide mobile bottom nav inside reader page to preserve distraction-free reading
  if (pathname.startsWith('/reader/')) {
    return null;
  }

  const isSchedule = pathname === '/' && currentHash === '#schedule';
  const isLibrary = (pathname === '/' && currentHash === '#catalog') || pathname.startsWith('/series');
  const isExplore = pathname === '/' && !isSchedule && !isLibrary;
  const isAccount = pathname.startsWith('/account') || pathname.startsWith('/author');

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 px-3 pb-safe pt-1 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-md mb-2 p-1.5 rounded-[28px] bg-neutral-950/90 dark:bg-neutral-950/90 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80 flex items-center justify-around gap-1">
        {/* 1. Explore Tab */}
        <Link
          href="/"
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all duration-200 active:scale-95 ${
            isExplore || (pathname === '/' && !isSchedule && !isLibrary)
              ? 'text-indigo-400 bg-white/10 font-bold shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5" strokeWidth={isExplore ? 2.5 : 1.75} />
          <span className="text-[10px] mt-0.5 tracking-tight">Explore</span>
          {(isExplore || (pathname === '/' && !isSchedule && !isLibrary)) && (
            <span className="absolute -top-1 w-2 h-0.5 bg-indigo-500 rounded-full" />
          )}
        </Link>

        {/* 2. Schedule Tab */}
        <Link
          href="/#schedule"
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all duration-200 active:scale-95 ${
            isSchedule
              ? 'text-indigo-400 bg-white/10 font-bold shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Calendar className="w-5 h-5" strokeWidth={isSchedule ? 2.5 : 1.75} />
          <span className="text-[10px] mt-0.5 tracking-tight">Schedule</span>
        </Link>

        {/* 3. Center Search Action Button */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search Catalog"
          className="relative -mt-4 p-3 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <Search className="w-5 h-5" strokeWidth={2.4} />
        </button>

        {/* 4. Library / Series Catalog Tab */}
        <Link
          href="/#catalog"
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all duration-200 active:scale-95 ${
            isLibrary
              ? 'text-indigo-400 bg-white/10 font-bold shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5" strokeWidth={isLibrary ? 2.5 : 1.75} />
          <span className="text-[10px] mt-0.5 tracking-tight">Library</span>
        </Link>

        {/* 5. Account / Profile Tab */}
        <Link
          href={user ? '/account' : '/auth/login?returnTo=/account'}
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 rounded-2xl transition-all duration-200 active:scale-95 ${
            isAccount
              ? 'text-indigo-400 bg-white/10 font-bold shadow-xs'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          {user?.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.picture}
              alt="Profile"
              className="w-5 h-5 rounded-full object-cover ring-1 ring-indigo-500/60"
            />
          ) : (
            <User className="w-5 h-5" strokeWidth={isAccount ? 2.5 : 1.75} />
          )}
          <span className="text-[10px] mt-0.5 tracking-tight">
            {user ? 'Account' : 'Sign In'}
          </span>
        </Link>
      </div>
    </nav>
  );
}
