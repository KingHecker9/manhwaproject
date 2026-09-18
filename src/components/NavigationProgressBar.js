'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const finishTimeoutRef = useRef(null);

  const startProgress = () => {
    if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    setVisible(true);
    setProgress(20);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timerRef.current);
          return 90;
        }
        // Trickle forward smoothly
        const diff = Math.max(1, (90 - prev) * 0.15);
        return prev + diff;
      });
    }, 120);
  };

  const completeProgress = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setProgress(100);

    finishTimeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  };

  // Complete progress on pathname or search parameter change
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams]);

  // Intercept click on internal links to start progress immediately
  useEffect(() => {
    const handleLinkClick = (e) => {
      // Find closest anchor tag
      const anchor = e.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const target = anchor.getAttribute('target');

      // Ignore external, hash only, mailto, tel, downloads, or new-tab clicks
      if (!href) return;
      if (target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (href.startsWith('http://') || href.startsWith('https://')) {
        // Check if external domain
        try {
          const url = new URL(href);
          if (url.origin !== window.location.origin) return;
        } catch {
          return;
        }
      }

      // Check if clicking same page hash link on current URL
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) return;

      // Start the route transition progress bar immediately
      startProgress();
    };

    document.addEventListener('click', handleLinkClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleLinkClick, { capture: true });
      if (timerRef.current) clearInterval(timerRef.current);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed top-0 left-0 right-0 h-[3px] z-[99999] pointer-events-none transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Moving progress bar line */}
      <div
        className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.85)] transition-all duration-150 ease-out"
        style={{
          width: `${progress}%`,
          transitionProperty: 'width',
        }}
      />

      {/* Leading glow pulse head */}
      {visible && progress < 100 && (
        <div
          className="absolute top-0 -mt-1 h-3 w-10 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400 to-white blur-[2px] pointer-events-none"
          style={{ left: `${progress}%` }}
        />
      )}
    </div>
  );
}
