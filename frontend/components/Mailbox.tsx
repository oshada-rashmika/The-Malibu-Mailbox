'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

interface MailboxProps {
  hasMail?: boolean;
  onLetterClick?: () => void;
  title?: string;
}

export default function Mailbox({ hasMail = true, onLetterClick }: MailboxProps) {
  const { theme } = useTheme();

  const bodyColor = theme === 'barbie' ? 'bg-[#ffb6c1]' : 'bg-[#add8e6]';
  const doorColor = theme === 'barbie' ? 'bg-[#ff69b4]' : 'bg-[#87cefa]';

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer group drop-shadow-2xl"
        onClick={onLetterClick}
        role="button"
        aria-label="Open Mailbox"
      >
        {/* CSS Mailbox Body */}
        <div className={`relative w-48 h-32 md:w-64 md:h-40 ${bodyColor} border-4 border-deep-velvet rounded-t-full rounded-b-lg flex items-center justify-center overflow-hidden z-20 transition-colors duration-500`}>
           {/* Mailbox Door Arc */}
           <div className={`absolute right-0 top-0 bottom-0 w-12 md:w-16 border-l-4 border-deep-velvet ${doorColor} rounded-r-lg flex flex-col items-center justify-center transition-colors duration-500`}>
             <div className="w-2 h-4 bg-deep-velvet rounded-full" />
           </div>
           
           {/* Mailbox Detail */}
           <div className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-3 bg-white/50 rounded-full" />
        </div>
        
        {/* Mailbox Post */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-8 h-12 bg-gray-400 border-x-4 border-b-4 border-deep-velvet z-10" />

        {/* The Red Flag */}
        <motion.div
          initial={{ rotate: 90 }}
          animate={{ rotate: hasMail ? 0 : 90 }}
          transition={{ type: 'spring', damping: 10, stiffness: 100, delay: 0.3 }}
          className="absolute top-4 md:top-6 right-16 md:right-20 origin-bottom z-10"
          style={{ width: '6px', height: '60px', backgroundColor: '#2D0B0B' }}
        >
          {/* Flag Banner */}
          <div className="absolute top-0 right-0 w-12 md:w-16 h-8 md:h-10 bg-[#ff3333] border-2 border-deep-velvet rounded-sm shadow-md" />
          
          {/* Sparkles if hasMail */}
          {hasMail && (
            <motion.div 
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 90, 180] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-8 -right-8 text-3xl drop-shadow-lg"
            >
              ✨
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      <div className="mt-20">
        <p className="text-xs uppercase tracking-[0.2em] text-deep-velvet/60 font-bold bg-white/50 px-4 py-2 rounded-full shadow-sm">
          {hasMail ? 'You have mail! Tap to open' : 'No mail yet'}
        </p>
      </div>
    </div>
  );
}
