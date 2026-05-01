import React from 'react';
import Link from 'next/link';
import { signOut } from '../app/login/actions';

export default function DashboardNav() {
  return (
    <nav className="hidden md:flex w-full max-w-5xl mx-auto mb-10 items-center justify-between px-6 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-[2rem] shadow-glass-sm font-sans relative z-50">
      <div className="flex gap-4 md:gap-8 items-center">
        <Link
          href="/dashboard/history"
          className="text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] text-deep-velvet hover:text-rose-gold hover:drop-shadow-[0_0_8px_rgba(224,191,184,0.8)] transition-all duration-300"
        >
          Memories
        </Link>
        <Link
          href="/dashboard/wallet"
          className="text-[11px] md:text-xs font-bold uppercase tracking-[0.15em] text-deep-velvet hover:text-rose-gold hover:drop-shadow-[0_0_8px_rgba(224,191,184,0.8)] transition-all duration-300"
        >
          My Wallet
        </Link>
      </div>

      <form action={signOut}>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 md:px-5 py-2 border border-deep-velvet/30 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest text-deep-velvet hover:bg-deep-velvet hover:text-silk-white transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-3.5 h-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </form>
    </nav>
  );
}