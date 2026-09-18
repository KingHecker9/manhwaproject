'use client';
import { Heart, Sparkles, Coffee, Award, Check } from 'lucide-react';

export default function DonatePage() {
  const tiers = [
    {
      name: 'Supporter',
      price: '$3',
      description: 'Buy a coffee for the creators and server upkeep.',
      icon: Coffee,
      perks: ['Supporter badge in profile', 'Discord reading role', 'Our eternal gratitude'],
    },
    {
      name: 'Super Reader',
      price: '$8',
      description: 'Support high-bandwidth image rendering and faster uploads.',
      icon: Heart,
      popular: true,
      perks: [
        'All Supporter perks',
        'Early preview access',
        'Direct chapter release alerts',
        'HD image stream prioritization',
      ],
    },
    {
      name: 'Champion',
      price: '$20',
      description: 'Empower independent manhwa authors and series licensing.',
      icon: Award,
      perks: [
        'All Super Reader perks',
        'Name in special credits',
        'Direct feedback on upcoming features',
        'Custom reading theme unlock',
      ],
    },
  ];

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Support The Project</span>
        </div>
        <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[var(--text-main)]">
          Support Studio Reader
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          We are committed to delivering a clean, ad-free, high-definition manhwa reading platform. Your direct support keeps our servers fast and helps creators thrive.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.name}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between border transition-all duration-200 ${
                tier.popular
                  ? 'bg-[var(--bg-card)] border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-indigo-500/40 shadow-xs'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </div>
              )}

              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-[var(--text-main)]">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-3">
                  <span className="text-3xl font-extrabold text-[var(--text-main)]">{tier.price}</span>
                  <span className="text-xs text-[var(--text-muted)]">/ month</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                  {tier.description}
                </p>

                <div className="space-y-2.5 border-t border-[var(--border-subtle)] pt-6">
                  {tier.perks.map((perk) => (
                    <div key={perk} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8">
                <button
                  type="button"
                  className={`w-full py-3 rounded-2xl text-xs font-semibold transition-all ${
                    tier.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25'
                      : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-hover)] text-[var(--text-main)] border border-[var(--border-subtle)]'
                  }`}
                >
                  Choose {tier.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}