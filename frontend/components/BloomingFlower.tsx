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

  const renderBlossom = () => {
    const type = flowerType.toLowerCase();

    switch (type) {
      case 'tulip':
        return (
          <>
            <path 
              d="M 50 60 C 30 60 30 20 50 15 C 70 20 70 60 50 60" 
              fill={colorHex} 
              className="opacity-95"
            />
            <path 
              d="M 50 60 C 35 60 35 30 50 25 C 65 30 65 60 50 60" 
              fill={colorHex} 
              className="brightness-90"
            />
          </>
        );
      case 'lily':
        return (
          <>
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <path
                key={angle}
                d="M 50 40 L 50 10 Q 55 25 50 40"
                fill={colorHex}
                transform={`rotate(${angle} 50 40)`}
                className="opacity-90"
              />
            ))}
            <circle cx="50" cy="40" r="4" fill="#fcd34d" />
          </>
        );
      case 'sunflower':
        return (
          <>
            {[...Array(12)].map((_, i) => (
              <ellipse
                key={i}
                cx="50"
                cy="20"
                rx="6"
                ry="15"
                fill={colorHex}
                transform={`rotate(${i * 30} 50 40)`}
              />
            ))}
            <circle cx="50" cy="40" r="12" fill="#451a03" />
          </>
        );
      case 'orchid':
        return (
          <>
            <ellipse cx="50" cy="30" rx="20" ry="10" fill={colorHex} opacity="0.8" />
            <ellipse cx="35" cy="45" rx="15" ry="10" fill={colorHex} transform="rotate(-30 35 45)" />
            <ellipse cx="65" cy="45" rx="15" ry="10" fill={colorHex} transform="rotate(30 65 45)" />
            <circle cx="50" cy="45" r="8" fill="#fcd34d" />
            <path d="M 45 45 Q 50 60 55 45" fill="#be123c" />
          </>
        );
      case 'rose':
      default:
        return (
          <>
            <circle cx="50" cy="25" r="14" fill={colorHex} className="opacity-90" />
            <circle cx="36" cy="38" r="14" fill={colorHex} className="opacity-90" />
            <circle cx="64" cy="38" r="14" fill={colorHex} className="opacity-90" />
            <circle cx="42" cy="54" r="14" fill={colorHex} className="opacity-90" />
            <circle cx="58" cy="54" r="14" fill={colorHex} className="opacity-90" />
            <circle cx="50" cy="41" r="8" fill="#fcd34d" />
          </>
        );
    }
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
          d="M 50 150 Q 40 90 50 40"
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
          style={{ originX: '50px', originY: '40px' }}
        >
          {renderBlossom()}
        </motion.g>
      </svg>
    </div>
  );
}