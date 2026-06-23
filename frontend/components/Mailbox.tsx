'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface MailboxProps {
  hasMail?: boolean;
  onLetterClick?: () => void;
  title?: string;
}

export default function Mailbox({ hasMail = true, onLetterClick }: MailboxProps) {

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <motion.div
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        className="relative cursor-pointer group drop-shadow-2xl flex flex-col items-center justify-center"
        onClick={onLetterClick}
        role="button"
        aria-label="Open Mailbox"
      >
        {/* Sparkles if hasMail */}
        {hasMail && (
          <motion.div 
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 90, 180] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-8 text-3xl drop-shadow-lg z-30"
          >
            ✨
          </motion.div>
        )}

        <img 
          src="/mail.png" 
          alt="Mailbox" 
          className="w-48 h-auto md:w-64 object-contain filter drop-shadow-xl z-20"
          style={{ imageRendering: 'pixelated' }}
        />
        
      </motion.div>
      
      <div className="mt-12">
        <p className="text-sm uppercase tracking-[0.2em] text-deep-velvet/80 font-bold bg-white px-6 py-3 border-4 border-deep-velvet shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">
          {hasMail ? 'You have mail! Tap to open' : 'No mail yet'}
        </p>
      </div>
    </div>
  );
}
