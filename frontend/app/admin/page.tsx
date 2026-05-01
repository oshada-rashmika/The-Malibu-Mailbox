import React from 'react';
import { createClient } from '../../utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== 'samanmali@gmail.com') {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen w-full flex flex-col py-20 px-4 bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0a0a0a] text-silk-white relative overflow-hidden">
      {/* Noir ambient glows using rose-gold against dark backgrounds */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-rose-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        <header className="text-center mb-16 w-full relative">
          <Link
            href="/dashboard"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-widest uppercase text-rose-gold/60 hover:text-rose-gold transition-colors"
          >
            ← Exit
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif text-rose-gold mb-4 tracking-tight drop-shadow-sm">
            Command Center
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-rose-gold/50 to-transparent mx-auto" />
          <p className="text-rose-gold/40 text-xs uppercase tracking-[0.3em] font-sans mt-4">
            Authorized Access Only
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Letters Management Module */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl hover:bg-white/10 transition-all duration-500">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-rose-gold/10 border border-rose-gold/20 flex items-center justify-center mr-4">
                <span className="text-rose-gold font-serif text-xl">L</span>
              </div>
              <h2 className="text-2xl font-serif text-silk-white">Letter Management</h2>
            </div>
            <p className="text-silk-white/60 font-sans text-sm mb-8 leading-relaxed">
              Compose, edit, and schedule the delivery timeline for future letters.
            </p>
            <button className="w-full py-4 bg-rose-gold text-deep-velvet rounded-xl font-bold tracking-[0.2em] uppercase text-xs shadow-lg shadow-rose-gold/20 hover:scale-[1.02] hover:bg-white transition-all duration-300">
              Manage Letters
            </button>
          </section>

          {/* Voucher Management Module */}
          <section className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl hover:bg-white/10 transition-all duration-500">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-rose-gold/10 border border-rose-gold/20 flex items-center justify-center mr-4">
                <span className="text-rose-gold font-serif text-xl">V</span>
              </div>
              <h2 className="text-2xl font-serif text-silk-white">Voucher Boutique</h2>
            </div>
            <p className="text-silk-white/60 font-sans text-sm mb-8 leading-relaxed">
              Mint new digital gifts, generate codes, and track redemption status.
            </p>
            <button className="w-full py-4 bg-transparent border border-rose-gold/40 text-rose-gold rounded-xl font-bold tracking-[0.2em] uppercase text-xs shadow-lg hover:scale-[1.02] hover:bg-rose-gold hover:text-deep-velvet transition-all duration-300">
              Manage Vouchers
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}