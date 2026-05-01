'use client';

import React, { useState } from 'react';
import { adminLogin } from './actions';

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      const response = await adminLogin(formData);
      if (response && response.error) {
        setError(response.error);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#0a0a0a] text-silk-white relative overflow-hidden">
      {/* Noir ambient glows using rose-gold against dark backgrounds */}
      <div className="absolute top-1/4 left-[-10%] w-[500px] h-[500px] bg-rose-gold/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-gold/10 border border-rose-gold/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(224,191,184,0.1)]">
            <span className="text-rose-gold font-serif text-2xl tracking-widest">M</span>
          </div>
          <h1 className="text-3xl font-serif text-rose-gold tracking-tight drop-shadow-sm">
            Noir Authority
          </h1>
          <p className="text-rose-gold/40 text-xs uppercase tracking-[0.3em] font-sans mt-4 max-w-[200px] mx-auto border-b border-rose-gold/20 pb-4">
            Restricted Access
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Subtle top glare inside the card */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-rose-gold/30 to-transparent" />

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="authority@domain.com"
                className="w-full px-5 py-4 bg-[#121212] border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/40 focus:border-rose-gold/50 transition-all text-silk-white placeholder:text-white/20 shadow-inner"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-rose-gold/70 ml-1">
                Passcode
              </label>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                className="w-full px-5 py-4 bg-[#121212] border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-gold/40 focus:border-rose-gold/50 transition-all text-silk-white placeholder:text-white/20 shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-4 bg-rose-gold text-deep-velvet rounded-xl font-bold tracking-[0.2em] uppercase text-xs shadow-[0_0_20px_rgba(224,191,184,0.15)] hover:scale-[1.02] hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:scale-100 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-deep-velvet/30 border-t-deep-velvet rounded-full animate-spin flex-shrink-0" />
                  <span>Verifying Identity...</span>
                </>
              ) : (
                <span>Initialize Sequence</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}