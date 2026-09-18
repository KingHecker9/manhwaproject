'use client';

import { useState, useEffect } from 'react';
import {
  Coffee,
  Heart,
  Sparkles,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Gift,
  Share2,
  MessageSquare,
} from 'lucide-react';

// Default fallback URL or environment variable
const BMC_BASE_URL =
  process.env.NEXT_PUBLIC_BUYMEACOFFEE_URL || 'https://buymeacoffee.com';

export function BuyMeCoffeeButton({
  seriesTitle = null,
  creatorName = 'Creators',
  size = 'md',
  className = '',
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={`relative inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 shadow-md hover:shadow-xl hover:shadow-amber-500/20 group cursor-pointer ${
        size === 'sm'
          ? 'px-3.5 py-1.5 text-xs bg-amber-400 hover:bg-amber-300 text-neutral-950'
          : size === 'lg'
          ? 'px-7 py-3.5 text-sm sm:text-base bg-amber-400 hover:bg-amber-300 text-neutral-950'
          : 'px-5 py-2.5 text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-neutral-950'
      } ${className}`}
    >
      <Coffee className="w-4 h-4 text-neutral-950 transition-transform group-hover:-rotate-12 group-hover:scale-110" />
      <span>Support {creatorName}</span>
      <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-neutral-950/40" />
      <span className="hidden sm:inline-block text-[11px] font-semibold opacity-80">
        Buy a Coffee
      </span>
    </button>
  );
}

export function SupportCreatorBanner({ onOpenModal, creatorName = 'Creators' }) {
  return (
    <section className="my-10 sm:my-14 rounded-3xl relative overflow-hidden border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[var(--bg-card)] to-indigo-500/10 p-6 sm:p-8 md:p-10 shadow-xl shadow-amber-500/5">
      {/* Ambient background glow dots */}
      <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4 sm:gap-5 max-w-xl">
          <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-neutral-950 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30 animate-pulse-glow">
            <Coffee className="w-6 sm:w-7 h-6 sm:h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Independent Creator Support</span>
            </div>
            <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              Love the chapters? Support our creators!
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
              We keep Lumina clean, fast, and 100% ad-free. Your direct coffee tips go straight to manhwa authors and digital translation teams to fund new chapter releases.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={onOpenModal}
            type="button"
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Coffee className="w-4 h-4 fill-neutral-950" />
            <span>Buy Me a Coffee</span>
          </button>
          <a
            href="/donate"
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)] font-semibold text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Membership Perks</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default function SupportCreatorModal({
  isOpen,
  onClose,
  seriesTitle = null,
  creatorName = 'Creator',
  bmcUrl = null,
}) {
  const [coffeeCount, setCoffeeCount] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [supporterName, setSupporterName] = useState('');
  const [supporterMessage, setSupporterMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEsc);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const targetBmcUrl = bmcUrl || BMC_BASE_URL;
  const pricePerCoffee = 3;
  const currentTotal = customAmount ? Number(customAmount) || 0 : coffeeCount * pricePerCoffee;

  const handleProceedToBmc = () => {
    // Construct Buy Me A Coffee URL with custom params if supported
    let destination = targetBmcUrl;
    try {
      const url = new URL(targetBmcUrl);
      if (supporterName) url.searchParams.set('name', supporterName);
      if (supporterMessage) url.searchParams.set('message', supporterMessage);
      destination = url.toString();
    } catch (e) {
      destination = targetBmcUrl;
    }
    window.open(destination, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(targetBmcUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg rounded-3xl bg-[var(--bg-card)] border border-amber-500/30 shadow-2xl overflow-hidden p-6 sm:p-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface)] transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with animated coffee icon */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-400/30">
            <Coffee className="w-6 h-6 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Buy Me a Coffee</span>
            </div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              Support {seriesTitle ? seriesTitle : creatorName}
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
          Every coffee you buy directly empowers creators to draw, write, translate, and release chapters faster.
        </p>

        {/* Coffee Tier Selector */}
        <div className="space-y-4 mb-6">
          <label className="block text-xs font-semibold text-[var(--text-main)] uppercase tracking-wider">
            Select Coffee Contribution
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { count: 1, label: '☕ 1 Coffee', price: '$3' },
              { count: 3, label: '☕ 3 Coffees', price: '$9' },
              { count: 5, label: '☕ 5 Coffees', price: '$15' },
              { count: 'custom', label: 'Custom', price: '$$$' },
            ].map((opt) => {
              const isSelected =
                opt.count === 'custom' ? !!customAmount : coffeeCount === opt.count && !customAmount;
              return (
                <button
                  key={String(opt.count)}
                  type="button"
                  onClick={() => {
                    if (opt.count === 'custom') {
                      setCustomAmount('25');
                    } else {
                      setCustomAmount('');
                      setCoffeeCount(opt.count);
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400/15 border-amber-500 text-amber-600 dark:text-amber-400 shadow-md shadow-amber-500/10 font-bold scale-102'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-amber-400/50 text-[var(--text-secondary)] font-medium'
                  }`}
                >
                  <span className="text-xs">{opt.label}</span>
                  <span className="text-xs font-bold text-[var(--text-main)] mt-0.5">{opt.price}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Amount Input if chosen */}
          {customAmount !== '' && (
            <div className="flex items-center gap-2 p-3 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
              <span className="text-sm font-bold text-[var(--text-main)] pl-1">$</span>
              <input
                type="number"
                min="1"
                placeholder="Enter custom tip amount (e.g. 25)"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-transparent text-sm text-[var(--text-main)] focus:outline-none"
              />
            </div>
          )}

          {/* Optional Supporter Note */}
          <div className="space-y-2 pt-2">
            <input
              type="text"
              placeholder="Your name or nickname (optional)"
              value={supporterName}
              onChange={(e) => setSupporterName(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500"
            />
            <textarea
              rows={2}
              placeholder="Say something nice or request a shoutout (optional)..."
              value={supporterMessage}
              onChange={(e) => setSupporterMessage(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Call to Action Bar */}
        <div className="space-y-3">
          <button
            onClick={handleProceedToBmc}
            type="button"
            className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-amber-400/30 hover:shadow-amber-400/50 hover:scale-101 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Coffee className="w-5 h-5 fill-neutral-950" />
            <span>Support ${currentTotal} with Buy Me a Coffee</span>
            <ExternalLink className="w-4 h-4 opacity-75" />
          </button>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] px-1 pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secure checkout via BuyMeACoffee</span>
            </span>
            <button
              onClick={handleCopyLink}
              type="button"
              className="hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Link copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy creator link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
