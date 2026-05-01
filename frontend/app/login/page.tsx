'use client';

import React from 'react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#F5E1E1] via-[#F9F7F7] to-[#E0BFB8] animate-gradient">
      <div className="w-full max-w-md p-8 mx-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-glass animate-in fade-in zoom-in duration-700">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-deep-velvet mb-3">The Malibu Mailbox</h1>
          <div className="h-0.5 w-16 bg-rose-gold mx-auto mb-4 rounded-full" />
          <p className="text-deep-velvet/60 italic font-light italic">
            "Your love story is waiting inside..."
          </p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-widest text-deep-velvet/70 ml-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="hello@romance.com"
              className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-gold/20 focus:border-rose-gold transition-all duration-500 placeholder:text-deep-velvet/20 text-deep-velvet"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium uppercase tracking-widest text-deep-velvet/70 ml-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-rose-gold/20 focus:border-rose-gold transition-all duration-500 placeholder:text-deep-velvet/20 text-deep-velvet"
            />
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-deep-velvet text-silk-white rounded-2xl font-bold tracking-widest uppercase text-xs shadow-xl shadow-deep-velvet/20 hover:bg-[#3D1414] hover:shadow-2xl hover:shadow-rose-gold/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group"
          >
            <span className="group-hover:tracking-[0.2em] transition-all duration-500">
              Unlock My Letters
            </span>
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/10 text-center">
          <Link 
            href="/" 
            className="text-xs uppercase tracking-widest text-deep-velvet/40 hover:text-rose-gold transition-colors"
          >
            ← Return to Sanctuary
          </Link>
        </div>
      </div>
    </main>
  );
}
