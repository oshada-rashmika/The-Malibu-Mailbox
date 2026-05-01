'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    name: 'Memories',
    href: '/dashboard/history',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>
      </svg>
    ),
  },
  {
    name: 'Home',
    href: '/dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    name: 'My Wallet',
    href: '/dashboard/wallet',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
      </svg>
    ),
  },
];

export default function SanctuaryDock() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] md:hidden w-full max-w-fit px-4">
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="relative"
      >
        {/* Isolated Background Layer to prevent flickering */}
        <div
          className="absolute inset-0 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-malibu-glow pointer-events-none"
          style={{ transform: 'translateZ(0)' }}
        />

        {/* Content Layer */}
        <div
          className="relative flex items-center gap-2 p-2 px-6 z-10"
          style={{ transform: 'translateZ(0)' }}
        >

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-full transition-colors duration-300 ${
                    isActive ? 'text-deep-velvet bg-white/20' : 'text-deep-velvet/50 hover:text-deep-velvet'
                  }`}
                >
                  <div className="shrink-0">{item.icon}</div>
                  <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

      </motion.nav>
    </div>
  );
}

