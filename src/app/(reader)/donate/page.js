'use client';

import { useState } from 'react';
import { Heart, Sparkles, Coffee, Award, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import SupportCreatorModal from '@/components/SupportCreatorModal';

export default function DonatePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);

  const tiers = [
    {
      name: 'Supporter',
      price: '$3',
      coffeeCount: 1,
      description: 'Buy a coffee for the creators and platform upkeep.',
      icon: Coffee,
      perks: ['Supporter badge in profile', 'Discord reading role', 'Our eternal gratitude'],
    },
    {
      name: 'Super Reader',
      price: '$9',
      coffeeCount: 3,
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
      price: '$15',
      coffeeCount: 5,
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

  const handleSelectTier = (tier) => {
    setSelectedTier(tier);
    setModalOpen(true);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Coffee className="w-3.5 h-3.5 fill-current" />
          <span>Support Creators & Platform</span>
        </div>
        <h1 className="font-serif-display text-3xl sm:text-5xl font-bold text-[var(--text-main)]">
          Fuel Our Manhwa Journey
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          Lumina is proudly ad-free and dedicated to providing high-definition reader experiences. Your contributions go directly towards creator compensation, digital translation, and high-speed image CDNs.
        </p>
      </div>

      {/* Quick Buy Me a Coffee Action Card */}
      <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-400/20 via-[var(--bg-card)] to-indigo-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-500/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center font-bold text-2xl shadow-lg shadow-amber-400/30 shrink-0">
            <Coffee className="w-7 h-7 fill-neutral-950" />
          </div>
          <div>
            <h3 className="font-serif-display text-lg sm:text-xl font-bold text-[var(--text-main)]">
              Instant One-Time Coffee Tip
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              No account required. Tip any amount directly via Buy Me a Coffee in seconds.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedTier(null);
            setModalOpen(true);
          }}
          type="button"
          className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-400/25 hover:scale-102 active:scale-95 transition-all shrink-0 cursor-pointer"
        >
          <Coffee className="w-4 h-4 fill-neutral-950" />
          <span>Tip with Buy Me a Coffee</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </button>
      </div>

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.name}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between border hover-lift transition-all duration-300 ${
                tier.popular
                  ? 'bg-[var(--bg-card)] border-indigo-500 shadow-xl shadow-indigo-500/10 scale-102 z-10'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-indigo-500/40 shadow-xs'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div>
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
                    tier.popular
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-[var(--text-main)]">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mt-2 mb-3">
                  <span className="text-3xl sm:text-4xl font-black text-[var(--text-main)]">
                    {tier.price}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-medium">/ month</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
                  {tier.description}
                </p>

                <div className="space-y-3 border-t border-[var(--border-subtle)] pt-6">
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
                  onClick={() => handleSelectTier(tier)}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    tier.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
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

      {/* Security & Gratitude Note */}
      <div className="mt-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Supported securely via Buy Me a Coffee. Cancel anytime or contribute one-time tips.</span>
      </div>

      {/* Creator Support Modal */}
      <SupportCreatorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        creatorName={selectedTier ? `${selectedTier.name} Supporter` : 'Lumina Creators'}
      />
    </main>
  );
}