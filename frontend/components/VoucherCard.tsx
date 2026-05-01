'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface VoucherCardProps {
  id: string;
  title: string;
  description: string;
  code?: string;
  isUsed?: boolean;
  onRedeem?: (id: string) => void;
}

export default function VoucherCard({ id, title, description, code, isUsed, onRedeem }: VoucherCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePosition] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
    setMousePosition({ x: 50, y: 50 });
  };

  const handleCardClick = () => {
    setIsExpanded((prev) => !prev);
  };

  const handleRedeemClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUsed || isRedeeming) return;

    setIsRedeeming(true);
    try {
      const res = await fetch(`http://localhost:5000/api/vouchers/${id}/redeem`, {
        method: 'PATCH',
      });
      const data = await res.json();

      if (data.success) {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#E0BFB8', '#F5E1E1', '#FFD700', '#FF69B4', '#a8c0ff'],
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#E0BFB8', '#F5E1E1', '#FFD700', '#FF69B4', '#a8c0ff'],
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();

        setTimeout(() => {
          if (onRedeem) onRedeem(id);
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to redeem voucher', error);
    } finally {
      setIsRedeeming(false);
    }
  };

  const angle = (mousePos.x / 100) * 360;

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      whileHover={!isUsed ? { scale: 1.01, y: -2 } : {}}
      className={`relative overflow-hidden rounded-3xl transition-all duration-500 shadow-sm cursor-pointer select-none ${isUsed
          ? 'bg-white/40 border border-white/30 grayscale-[50%] opacity-70'
          : 'bg-white/60 border border-white/60 hover:shadow-glass-sm backdrop-blur-xl'
        }`}
    >
      {/* Foil glare */}
      {!isUsed && isHovered && (
        <div
          className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-300 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.8) 0%, transparent 60%)`,
          }}
        />
      )}

      {/* ── Collapsed row: always visible ── */}
      <div className="flex items-center gap-4 px-6 py-5">
        {/* Icon */}
        <div className="w-12 h-12 shrink-0 rounded-full bg-silk-white border border-rose-gold/30 flex items-center justify-center shadow-inner">
          <span className="text-lg font-serif text-deep-velvet">
            {title ? title.charAt(0).toUpperCase() : 'V'}
          </span>
        </div>

        {/* Title */}
        <h3
          className="flex-1 text-lg font-serif truncate transition-all duration-300"
          style={{
            backgroundImage:
              isHovered && !isUsed
                ? `conic-gradient(from ${angle}deg at ${mousePos.x}% ${mousePos.y}%, #E0BFB8, #a8c0ff, #fbc2eb, #F5E1E1, #E0BFB8)`
                : 'none',
            WebkitBackgroundClip: isHovered && !isUsed ? 'text' : 'border-box',
            WebkitTextFillColor:
              isHovered && !isUsed ? 'transparent' : 'var(--color-deep-velvet)',
            color: isHovered && !isUsed ? 'transparent' : 'var(--color-deep-velvet)',
          }}
        >
          {title || 'Special Gift'}
        </h3>

        {/* Right side: redeemed badge OR chevron */}
        <div className="shrink-0 flex items-center gap-3">
          {isUsed ? (
            <span className="px-2 py-1 bg-deep-velvet/5 text-deep-velvet/40 text-[10px] uppercase tracking-widest font-bold rounded">
              Redeemed
            </span>
          ) : (
            <motion.span
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-deep-velvet/30 text-xs"
            >
              ▼
            </motion.span>
          )}
        </div>
      </div>

      {/* ── Expanded content ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 flex flex-col gap-4">
              {/* Divider */}
              <div className="h-px w-full bg-rose-gold/15" />

              {/* Description */}
              <p className="text-sm font-sans text-deep-velvet/70 leading-relaxed">
                {description || 'A token of appreciation.'}
              </p>

              {/* Secret code */}
              {code && !isUsed && (
                <div className="inline-block px-3 py-1 bg-rose-gold/20 border border-rose-gold/40 rounded-lg text-xs font-mono font-medium tracking-widest text-[#a57070] w-fit">
                  {code}
                </div>
              )}

              {/* Redeem button */}
              {!isUsed && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleRedeemClick}
                    disabled={isRedeeming}
                    className="px-5 py-2.5 bg-deep-velvet text-silk-white rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 hover:shadow-glass hover:bg-[#3D1414] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-rose-gold/40"
                  >
                    {isRedeeming ? '...' : 'Redeem'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}