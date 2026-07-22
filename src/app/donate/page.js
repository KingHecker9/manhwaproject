'use client';

import { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';

export default function DonatePage() {
  const [tier, setTier] = useState('custom');
  const [customAmount, setCustomAmount] = useState('10');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('GH'); // Default Ghana

  // Supported Paystack Countries with primary currency codes
  const paystackCountries = [
    { code: 'GH', name: 'Ghana (Mobile Money / Cards)', currency: 'GHS' },
    { code: 'NG', name: 'Nigeria (Cards / Bank / USSD)', currency: 'NGN' },
    { code: 'KE', name: 'Kenya (M-Pesa / Cards)', currency: 'KES' },
    { code: 'ZA', name: 'South Africa (EFT / Cards)', currency: 'ZAR' },
    { code: 'CI', name: 'Côte d’Ivoire (Mobile Money)', currency: 'XOF' },
    { code: 'EG', name: 'Egypt (Cards / ValU)', currency: 'EGP' },
    { code: 'RW', name: 'Rwanda (Mobile Money)', currency: 'RWF' },
  ];

  const selectedCountry = paystackCountries.find((c) => c.code === country);

  // Paystack Configuration
  const config = {
    reference: new Date().getTime().toString(),
    email: email || 'supporter@manga.com',
    amount: (parseFloat(customAmount) || 10) * 100, // Paystack expects amounts in smallest unit (e.g. pesewas/kobo)
    currency: selectedCountry?.currency || 'GHS',
    publicKey: 'pk_test_466fed7bf1320c0b7a5f17a54ede05b01de0e93f',
  };

  const onSuccess = (reference) => {
    alert(`Thank you for your donation! Reference ID: ${reference.reference}`);
  };

  const onClose = () => {
    alert('Transaction canceled.');
  };

  const initializePayment = usePaystackPayment(config);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return alert('Please enter your email to proceed.');
    initializePayment(onSuccess, onClose);
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-extrabold text-yellow-400 mb-2 text-center">
        Support the Platform
      </h1>
      <p className="text-neutral-400 text-sm mb-8 text-center">
        Your contributions keep hosting live and support local creators directly via Mobile Money.
      </p>

      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl space-y-5">
        
        {/* Tier Selection */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-2">Select Donation Type</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => { setTier('5'); setCustomAmount('5'); }}
              className={`p-3 rounded text-xs font-bold border transition ${
                tier === '5' ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-neutral-800 bg-neutral-950'
              }`}
            >
              Preset $5
            </button>
            <button
              type="button"
              onClick={() => { setTier('10'); setCustomAmount('10'); }}
              className={`p-3 rounded text-xs font-bold border transition ${
                tier === '10' ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-neutral-800 bg-neutral-950'
              }`}
            >
              Preset $10
            </button>
            <button
              type="button"
              onClick={() => setTier('custom')}
              className={`p-3 rounded text-xs font-bold border transition ${
                tier === 'custom' ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-neutral-800 bg-neutral-950'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {/* Custom Amount Entry */}
        {tier === 'custom' && (
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Enter Custom Amount ({selectedCountry?.currency})
            </label>
            <input
              type="number"
              min="1"
              required
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full bg-slate-100 text-black border border-slate-300 rounded p-2.5 text-sm font-semibold outline-none"
            />
          </div>
        )}

        {/* Country Selector */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Your Country (Paystack Markets)</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-slate-100 text-black border border-slate-300 rounded p-2.5 text-sm font-medium outline-none"
          >
            {paystackCountries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* User Email */}
        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1">Your Email</label>
          <input
            type="email"
            required
            placeholder="reader@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-100 text-black border border-slate-300 rounded p-2.5 text-sm font-medium outline-none placeholder:text-neutral-500"
          />
        </div>

        {/* Paystack Trigger Button */}
        <button
          type="submit"
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black rounded font-bold text-sm transition"
        >
          Donate {customAmount} {selectedCountry?.currency} via Paystack
        </button>
      </form>
    </main>
  );
}