'use client';

import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-silk-white to-blush-pink overflow-hidden relative">
      {/* Decorative floating elements for extra romance */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-rose-gold/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blush-pink/40 rounded-full blur-3xl animate-pulse delay-700" />

      <div className="relative w-full max-w-md p-10 mx-4 bg-white/60 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-glass animate-in fade-in zoom-in duration-1000">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-deep-velvet mb-3 tracking-tight">
            The Malibu Mailbox
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-gold to-transparent mx-auto mb-4" />
          <p className="text-[#a57070] font-light italic text-sm">
            "Your love story is waiting inside..."
          </p>
        </div>

        <form className="space-y-7" onSubmit={(e) => e.preventDefault()} autoComplete="off">
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#a57070] ml-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="your.email@example.com"
              autoComplete="new-password"
              defaultValue=""
              className="w-full px-6 py-4 bg-silk-white/60 border border-rose-gold/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-gold/30 focus:border-rose-gold transition-all duration-500 placeholder:text-deep-velvet/30 text-deep-velvet shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-[#a57070] ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="your secure password"
              autoComplete="new-password"
              defaultValue=""
              className="w-full px-6 py-4 bg-silk-white/60 border border-rose-gold/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-gold/30 focus:border-rose-gold transition-all duration-500 placeholder:text-deep-velvet/30 text-deep-velvet shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-deep-velvet text-silk-white rounded-2xl font-bold tracking-[0.2em] uppercase text-xs shadow-2xl shadow-deep-velvet/30 hover:bg-[#3D1414] hover:shadow-rose-gold/50 hover:-translate-y-1 active:translate-y-0 hover:text-rose-gold transition-all duration-500 group overflow-hidden relative"
          >
            <span className="relative z-10 group-hover:scale-105 transition-transform duration-500 block">
              Unlock My Letters
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-rose-gold/20 text-center">
          <Link 
            href="/" 
            className="group inline-flex items-center gap-2 text-xs font-medium tracking-[0.1em] text-deep-velvet/50 hover:text-deep-velvet transition-all duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-px after:bottom-0 after:left-0 after:bg-deep-velvet after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left pb-1"
          >
            <span className="group-hover:-translate-x-1 transition-transform duration-300">←</span> 
            RETURN TO SANCTUARY
          </Link>
        </div>
      </div>
    </main>
  );
}
