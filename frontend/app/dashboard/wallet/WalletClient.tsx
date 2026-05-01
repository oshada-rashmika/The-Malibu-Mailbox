'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

type Voucher = {
  id: string;
  title: string;
  description: string;
  is_used: boolean;
  code?: string;
  expires_at?: string;
};

export default function WalletClient({ vouchers }: { vouchers: Voucher[] }) {
  const [activeTab, setActiveTab] = useState<'available' | 'used'>('available');

  const filteredVouchers = vouchers.filter((v) =>
    activeTab === 'available' ? !v.is_used : v.is_used
  );

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
      <header className="text-center mb-12 w-full relative">
        <Link
          href="/dashboard"
          className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-widest uppercase text-[#a57070] hover:text-deep-velvet transition-colors"
        >
          ← Back
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif text-deep-velvet mb-4">
          Voucher Boutique
        </h1>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-gold to-transparent mx-auto" />
      </header>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-white/40 backdrop-blur-xl border border-white/50 rounded-full shadow-sm mb-12 relative">
        <button
          onClick={() => setActiveTab('available')}
          className={`relative px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors z-10 ${
            activeTab === 'available' ? 'text-deep-velvet' : 'text-[#a57070] hover:text-deep-velvet/80'
          }`}
        >
          Available
        </button>
        <button
          onClick={() => setActiveTab('used')}
          className={`relative px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors z-10 ${
            activeTab === 'used' ? 'text-deep-velvet' : 'text-[#a57070] hover:text-deep-velvet/80'
          }`}
        >
          Redeemed
        </button>

        {/* Animated Active Pill Indicator */}
        <motion.div
          className="absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-glass-sm border border-white"
          initial={false}
          animate={{
            left: activeTab === 'available' ? '4px' : 'calc(50% - 4px)',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Vouchers Grid */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
          >
            {filteredVouchers.length === 0 ? (
              <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center p-12 bg-white/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-glass-sm">
                <svg
                  className="w-10 h-10 text-[#a57070]/50 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-deep-velvet/60 font-serif italic text-lg">
                  {activeTab === 'available' 
                    ? "No available vouchers." 
                    : "No redeemed vouchers yet."}
                </p>
              </div>
            ) : (
              filteredVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className={`group relative flex items-center p-6 bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl transition-all duration-300 hover:shadow-glass-sm hover:-translate-y-1 ${
                    voucher.is_used ? 'opacity-60 grayscale-[50%]' : 'shadow-sm'
                  }`}
                >
                  {/* Minimalist Icon / Monogram */}
                  <div className="w-14 h-14 shrink-0 rounded-full bg-silk-white border border-rose-gold/30 flex items-center justify-center shadow-inner mr-6">
                    <span className="text-xl font-serif text-deep-velvet">
                      {voucher.title ? voucher.title.charAt(0).toUpperCase() : 'V'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-serif text-deep-velvet truncate mb-1">
                      {voucher.title || 'Special Gift'}
                    </h3>
                    <p className="text-sm font-sans text-deep-velvet/70 line-clamp-2">
                      {voucher.description || 'A token of appreciation.'}
                    </p>
                    
                    {voucher.code && !voucher.is_used && (
                      <div className="mt-3 inline-block px-3 py-1 bg-rose-gold/20 border border-rose-gold/40 rounded-lg text-xs font-mono font-medium tracking-widest text-[#a57070]">
                        {voucher.code}
                      </div>
                    )}
                  </div>

                  {voucher.is_used && (
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-deep-velvet/5 text-deep-velvet/40 text-[10px] uppercase tracking-widest font-bold rounded">
                        Redeemed
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}