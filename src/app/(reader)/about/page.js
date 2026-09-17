import Link from 'next/link';
import { BookOpen, Sparkles, Heart, ShieldCheck, Compass, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 sm:p-12 shadow-xs space-y-8">
        {/* Header */}
        <div className="space-y-3 border-b border-[var(--border-subtle)] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About The Platform</span>
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[var(--text-main)]">
            About Studio Reader
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Studio Reader is a premier manhwa and webtoons reading destination crafted specifically for the digital strip format. Built with love by avid comic lovers and independent creators.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--text-main)]">Seamless Vertical Canvas</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Zero margins, zero gaps. Experience continuous scroll comic panels as they were originally drawn.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--text-main)]">Distraction-Free UI</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Intelligent auto-hiding controls slide away when reading down and gently return when scrolling up.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="font-semibold text-sm text-[var(--text-main)]">Creator Support</h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Direct tools for manhwa creators to publish chapters, manage series, and connect with their audience.
            </p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50">
          <div>
            <h4 className="font-semibold text-sm text-[var(--text-main)]">Ready to dive in?</h4>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">Explore popular and ongoing manhwa in our library.</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all shrink-0"
          >
            <span>Browse Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </main>
  );
}