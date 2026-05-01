'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import VoucherCard from '../../../components/VoucherCard';

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
  const [localVouchers, setLocalVouchers] = useState<Voucher[]>(vouchers);

  const filteredVouchers = localVouchers.filter((v) =>
    activeTab === 'available' ? !v.is_used : v.is_used
  );

  const handleRedeemSuccess = (id: string) => {
    setLocalVouchers((prev) =>
      prev.map((v) => (v.id === id ? { ...v, is_used: true } : v))
    );
  };

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
                <VoucherCard 
                  key={voucher.id}
                  id={voucher.id}
                  title={voucher.title} 
                  description={voucher.description} 
                  code={voucher.code} 
                  isUsed={voucher.is_used}
                  onRedeem={handleRedeemSuccess} 
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}