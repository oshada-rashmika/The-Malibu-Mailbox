'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { signOut } from '../app/login/actions';

export default function MobileSignOut() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute top-6 right-6 z-[60] md:hidden"
    >
      <form action={signOut}>
        <button
          type="submit"
          className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full shadow-glass-sm group active:scale-95 transition-all duration-300 hover:shadow-[0_0_15px_rgba(224,191,184,0.4)]"
        >
          <LogOut className="w-3.5 h-3.5 text-deep-velvet transition-colors group-hover:text-rose-gold" />
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-deep-velvet font-sans group-hover:text-rose-gold transition-colors">
            Sign Out
          </span>
        </button>
      </form>
    </motion.div>
  );
}
