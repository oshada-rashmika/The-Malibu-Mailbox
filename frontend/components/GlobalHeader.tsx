'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { X, LogOut, Heart } from 'lucide-react';
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
          {theme === 'barbie' ? (
            <Heart size={24} className="text-[#ff69b4] fill-[#ff69b4]" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ff6b6b" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.5-.9 2.8-2.2 3.5C15.5 10 17 11.5 17 13.5c0 2-1.5 3.5-3.2 4-1.3.7-2.2 2-2.2 3.5a4 4 0 0 1-8 0c0-1.5.9-2.8 2.2-3.5-1.7-.5-3.2-2-3.2-4 0-2 1.5-3.5 3.2-4C4.5 8.8 3.6 7.5 3.6 6a4 4 0 0 1 8-4Z"/>
            </svg> // Flower for Stitch
          )}
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
              className="fixed inset-y-0 right-0 w-full sm:w-80 bg-silk-white shadow-2xl z-[100] flex flex-col p-6 items-center justify-center"
            >
              <div className="absolute top-6 right-6">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-deep-velvet/5 text-deep-velvet hover:bg-deep-velvet/10 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Oversized Emoji Menu */}
              <nav className="flex flex-col gap-8 flex-1 items-center justify-center w-full">
                <Link href="/dashboard/history" onClick={() => setMenuOpen(false)} className="group flex flex-col items-center gap-2">
                  <span className="text-6xl group-hover:scale-125 transition-transform duration-300 drop-shadow-md">📸</span>
                </Link>
                <Link href="/dashboard/notebook" onClick={() => setMenuOpen(false)} className="group flex flex-col items-center gap-2">
                  <span className="text-6xl group-hover:scale-125 transition-transform duration-300 drop-shadow-md">📓</span>
                </Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="group flex flex-col items-center gap-2">
                  <span className="text-6xl group-hover:scale-125 transition-transform duration-300 drop-shadow-md">🏠</span>
                </Link>
                <Link href="/dashboard/boutique" onClick={() => setMenuOpen(false)} className="group flex flex-col items-center gap-2">
                  <span className="text-6xl group-hover:scale-125 transition-transform duration-300 drop-shadow-md">🛍️</span>
                </Link>
                <Link href="/dashboard/wallet" onClick={() => setMenuOpen(false)} className="group flex flex-col items-center gap-2">
                  <span className="text-6xl group-hover:scale-125 transition-transform duration-300 drop-shadow-md">👛</span>
                </Link>
              </nav>

              <form action={signOut} className="mt-8 w-full max-w-[200px]">
                <button
                  type="submit"
                  className="flex items-center gap-2 w-full justify-center px-4 py-3 border-2 border-deep-velvet/20 rounded-full text-xs font-bold uppercase tracking-widest text-deep-velvet hover:bg-deep-velvet hover:text-silk-white hover:scale-105 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
