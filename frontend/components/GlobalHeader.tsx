'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';
import { X, LogOut, Heart } from 'lucide-react';
import { signOut } from '../app/login/actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalHeader() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide header on landing and login pages
  if (pathname === '/' || pathname === '/login') {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] p-4 flex justify-between items-center">
        {/* Magical Toggle (Top-Left) */}
        <button
          onClick={toggleTheme}
          className="relative flex items-center bg-white/40 backdrop-blur-md rounded-full p-1 shadow-[0_4px_16px_rgba(31,38,135,0.2)] border border-white/50 w-[84px] h-[44px] outline-none cursor-pointer"
        >
          {/* Active indicator sliding background */}
          <motion.div
            className="absolute top-1 bottom-1 w-[36px] bg-white rounded-full shadow-sm z-0"
            animate={{ left: theme === 'barbie' ? '4px' : '42px' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
          <div className="relative z-10 w-[38px] h-full flex items-center justify-center pointer-events-none">
            <img src="/bb.png" alt="Barbie" className={`w-7 h-7 object-contain transition-opacity ${theme === 'barbie' ? 'opacity-100' : 'opacity-40'}`} />
          </div>
          <div className="relative z-10 w-[38px] h-full flex items-center justify-center pointer-events-none">
            <img src="/stitch.png" alt="Stitch" className={`w-7 h-7 object-contain transition-opacity ${theme === 'stitch' ? 'opacity-100' : 'opacity-40'}`} />
          </div>
        </button>

        {/* Hamburger Menu (Top-Right) */}
        <button
          onClick={() => setMenuOpen(true)}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md border border-white/50 shadow-[0_4px_16px_rgba(31,38,135,0.2)] hover:bg-white/60 transition-colors cursor-pointer"
        >
          {theme === 'barbie' ? (
            <img src="/heart.png" alt="Menu" className="w-6 h-6 object-contain drop-shadow-sm" />
          ) : (
            <img src="/stitch-menu.png" alt="Menu" className="w-6 h-6 object-contain drop-shadow-sm" />
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
              className="fixed inset-y-0 right-0 w-full sm:w-80 bg-background border-l-4 border-deep-velvet z-[110] flex flex-col p-6 items-center justify-center"
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
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300" style={{ imageRendering: 'pixelated' }}>📸</span>
                  <span className="text-xl tracking-widest uppercase font-bold text-deep-velvet group-hover:text-rose-gold transition-colors">Memories</span>
                </Link>
                <Link href="/dashboard/notebook" onClick={() => setMenuOpen(false)} className="group flex flex-col items-center gap-2">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300" style={{ imageRendering: 'pixelated' }}>📓</span>
                  <span className="text-xl tracking-widest uppercase font-bold text-deep-velvet group-hover:text-rose-gold transition-colors">Notebook</span>
                </Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="group flex flex-col items-center gap-2">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300" style={{ imageRendering: 'pixelated' }}>🏠</span>
                  <span className="text-xl tracking-widest uppercase font-bold text-deep-velvet group-hover:text-rose-gold transition-colors">Home</span>
                </Link>
                <Link href="/dashboard/boutique" onClick={() => setMenuOpen(false)} className="group flex flex-col items-center gap-2">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300" style={{ imageRendering: 'pixelated' }}>🛍️</span>
                  <span className="text-xl tracking-widest uppercase font-bold text-deep-velvet group-hover:text-rose-gold transition-colors">Boutique</span>
                </Link>
                <Link href="/dashboard/wallet" onClick={() => setMenuOpen(false)} className="group flex flex-col items-center gap-2">
                  <span className="text-6xl group-hover:scale-110 transition-transform duration-300" style={{ imageRendering: 'pixelated' }}>👛</span>
                  <span className="text-xl tracking-widest uppercase font-bold text-deep-velvet group-hover:text-rose-gold transition-colors">My Wallet</span>
                </Link>
              </nav>

              <form action={signOut} className="mt-8 w-full max-w-[200px]">
                <button
                  type="submit"
                  className="flex items-center gap-2 w-full justify-center px-4 py-3 border-4 border-deep-velvet bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.1)] text-lg font-bold uppercase tracking-widest text-deep-velvet hover:bg-deep-velvet hover:text-white active:translate-x-1 active:translate-y-1 active:shadow-none transition-all duration-300"
                >
                  <LogOut className="w-5 h-5" />
                  <span>SIGN OUT</span>
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
