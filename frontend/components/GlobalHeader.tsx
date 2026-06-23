'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { Menu, X, LogOut } from 'lucide-react';
import { signOut } from '../app/login/actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalHeader() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
        {/* Magical Toggle (Top-Left) */}
        <button
          onClick={toggleTheme}
          className="pointer-events-auto relative group transition-transform hover:scale-105 active:scale-95 outline-none"
        >
          {theme === 'barbie' ? (
            <div className="w-16 h-16 rounded-full border-4 border-blush-pink shadow-[0_0_15px_var(--theme-rose-gold)] overflow-hidden bg-white/50 backdrop-blur flex items-center justify-center p-1">
              <img src="/barbie-logo.png" alt="Barbie Mode" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-16 h-16 border-4 border-silk-white shadow-[0_0_15px_var(--theme-silk-white)] overflow-hidden bg-white/50 backdrop-blur flex items-center justify-center p-1" style={{ borderRadius: '50% 20% 50% 20%' }}>
              <img src="/stitch-logo.png" alt="Stitch Mode" className="w-full h-full object-contain" />
            </div>
          )}
        </button>

        {/* Hamburger Menu (Top-Right) */}
        <button
          onClick={() => setMenuOpen(true)}
          className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-full bg-white/30 backdrop-blur border border-white/40 text-deep-velvet shadow-[0_4px_16px_rgba(31,38,135,0.2)] hover:bg-white/50 transition-colors"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Hamburger Overlay Drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-64 bg-silk-white shadow-2xl z-[100] flex flex-col p-6"
            >
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-deep-velvet/5 text-deep-velvet hover:bg-deep-velvet/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-6 flex-1">
                <Link href="/dashboard/history" onClick={() => setMenuOpen(false)} className="text-lg font-bold uppercase tracking-wider text-deep-velvet hover:text-rose-gold transition-colors">Memories</Link>
                <Link href="/dashboard/notebook" onClick={() => setMenuOpen(false)} className="text-lg font-bold uppercase tracking-wider text-deep-velvet hover:text-rose-gold transition-colors">Notebook</Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="text-lg font-bold uppercase tracking-wider text-deep-velvet hover:text-rose-gold transition-colors">Home</Link>
                <Link href="/dashboard/boutique" onClick={() => setMenuOpen(false)} className="text-lg font-bold uppercase tracking-wider text-deep-velvet hover:text-rose-gold transition-colors">Boutique</Link>
                <Link href="/dashboard/wallet" onClick={() => setMenuOpen(false)} className="text-lg font-bold uppercase tracking-wider text-deep-velvet hover:text-rose-gold transition-colors">My Wallet</Link>
              </nav>

              <form action={signOut} className="mt-auto">
                <button
                  type="submit"
                  className="flex items-center gap-2 w-full justify-center px-4 py-3 border border-deep-velvet/30 rounded-full text-xs font-bold uppercase tracking-widest text-deep-velvet hover:bg-deep-velvet hover:text-silk-white transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
