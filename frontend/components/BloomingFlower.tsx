'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface BloomingFlowerProps {
  flowerType: string;
  meaning: string;
  colorHex: string;
}

export default function BloomingFlower({ flowerType, meaning, colorHex }: BloomingFlowerProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const toggleTooltip = () => {
    setShowTooltip((prev) => !prev);
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-end w-32 h-48 cursor-pointer select-none"
      onClick={toggleTooltip}
    >
      {/* Glassmorphic Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="absolute top-0 -translate-y-full mb-4 z-20 flex flex-col items-center min-w-[140px] px-4 py-3 bg-white/30 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] text-center text-slate-800"
          >
            <h4 className="font-serif font-semibold text-sm mb-1">{flowerType}</h4>
            <p className="text-xs italic opacity-80 leading-relaxed font-sans">
              "{meaning}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SVG Canvas for the Flower */}
      <svg viewBox="0 0 100 150" className="w-full h-full overflow-visible drop-shadow-md">
        {/* Stem (drawn growing upwards) */}
        <motion.path
          d="M 50 150 Q 40 100 50 80"
          fill="transparent"
          stroke="#4ade80"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        
        {/* Leaf */}
        <motion.path
          d="M 50 120 Q 70 100 80 110 Q 60 130 50 120"
          fill="#4ade80"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8, type: 'spring' }}
          style={{ originX: 0, originY: 1 }}
        />

        {/* Blossom Group */}
        <motion.g
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 1.1, 
            type: 'spring', 
            stiffness: 100, 
            damping: 12 
          }}
          style={{ originX: '50px', originY: '80px' }}
        >
          {/* Dynamic Color Petals */}
          <circle cx="50" cy="65" r="14" fill={colorHex} className="opacity-90" />
          <circle cx="36" cy="78" r="14" fill={colorHex} className="opacity-90" />
          <circle cx="64" cy="78" r="14" fill={colorHex} className="opacity-90" />
          <circle cx="42" cy="94" r="14" fill={colorHex} className="opacity-90" />
          <circle cx="58" cy="94" r="14" fill={colorHex} className="opacity-90" />
          
          {/* Flower Center */}
          <circle cx="50" cy="81" r="8" fill="#fcd34d" />
        </motion.g>
      </svg>
    </div>
  );
}