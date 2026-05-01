'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface VoucherCardProps {
  title: string;
  description: string;
  code?: string;
  isUsed?: boolean;
}

export default function VoucherCard({ title, description, code, isUsed }: VoucherCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isUsed) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleMouseEnter = () => {
    if (isUsed) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Smoothly return to center when mouse leaves
    setMousePosition({ x: 50, y: 50 });
  };

  // Convert mouse X position to a rotational angle for the conic gradient
  const angle = (mousePos.x / 100) * 360;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={!isUsed ? { scale: 1.02, y: -4 } : {}}
      className={`relative overflow-hidden p-6 rounded-3xl transition-all duration-500 flex items-center shadow-sm ${
        isUsed
          ? 'bg-white/40 border border-white/30 grayscale-[50%] opacity-70'
          : 'bg-white/60 border border-white/60 hover:shadow-glass-sm cursor-pointer backdrop-blur-xl'
      }`}
    >
      {/* Soft background foil glare tracking the mouse on the card itself */}
      {!isUsed && isHovered && (
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`
          }}
        />
      )}

      {/* Boutique Icon */}
      <div className="w-14 h-14 shrink-0 rounded-full bg-silk-white border border-rose-gold/30 flex items-center justify-center shadow-inner mr-6 z-10">
        <span className="text-xl font-serif text-deep-velvet">
          {title ? title.charAt(0).toUpperCase() : 'V'}
        </span>
      </div>

      <div className="flex-1 min-w-0 z-10">
        {/* Holographic Foil Text */}
        <h3
          className="text-xl font-serif truncate mb-1 transition-all duration-300"
          style={{
            backgroundImage: isHovered && !isUsed
              ? `conic-gradient(from ${angle}deg at ${mousePos.x}% ${mousePos.y}%, #E0BFB8, #a8c0ff, #fbc2eb, #F5E1E1, #E0BFB8)`
              : 'none',
            WebkitBackgroundClip: isHovered && !isUsed ? 'text' : 'border-box',
            WebkitTextFillColor: isHovered && !isUsed ? 'transparent' : 'var(--color-deep-velvet)',
            color: isHovered && !isUsed ? 'transparent' : 'var(--color-deep-velvet)',
          }}
        >
          {title || 'Special Gift'}
        </h3>

        <p className="text-sm font-sans text-deep-velvet/70 line-clamp-2">
          {description || 'A token of appreciation.'}
        </p>

        {code && !isUsed && (
          <div className="mt-3 inline-block px-3 py-1 bg-rose-gold/20 border border-rose-gold/40 rounded-lg text-xs font-mono font-medium tracking-widest text-[#a57070]">
            {code}
          </div>
        )}
      </div>

      {isUsed && (
        <div className="absolute top-4 right-4">
          <span className="px-2 py-1 bg-deep-velvet/5 text-deep-velvet/40 text-[10px] uppercase tracking-widest font-bold rounded">
            Redeemed
          </span>
        </div>
      )}
    </motion.div>
  );
}