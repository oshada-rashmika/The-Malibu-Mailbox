'use client';

import React, { useMemo, useState } from 'react';

export interface RomanticCardProps {
  noteTo: string;
  noteFrom: string;
  message: string;
  createdAt?: string;
  className?: string;
}

const CARD_COLOR = '#f7efe4';

const scallopStyle: React.CSSProperties = {
  backgroundImage: `radial-gradient(circle at 10px 10px, transparent 9px, ${CARD_COLOR} 10px)`,
  backgroundSize: '20px 20px'
};

export default function RomanticCard({
  noteTo,
  noteFrom,
  message,
  createdAt,
  className = ''
}: RomanticCardProps) {
  const [expanded, setExpanded] = useState(false);

  const formattedDate = useMemo(() => {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString();
  }, [createdAt]);

  const trimmedMessage = message.trim();

  return (
    <button
      type="button"
      onClick={() => setExpanded((prev) => !prev)}
      aria-expanded={expanded}
      className={`relative w-full text-left rounded-[32px] border border-[#e8d7c4] shadow-[0_20px_40px_rgba(99,68,45,0.18)] px-6 py-8 sm:px-10 sm:py-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-gold/60 ${className}`}
      style={{
        backgroundColor: CARD_COLOR,
        backgroundImage:
          'linear-gradient(140deg, rgba(255,255,255,0.65), rgba(255,255,255,0) 60%), linear-gradient(180deg, #f7efe4 0%, #f3e6d6 100%)'
      }}
    >
      <div className="pointer-events-none absolute -top-3 left-6 right-6 h-6" style={scallopStyle} />
      <div className="pointer-events-none absolute -bottom-3 left-6 right-6 h-6 rotate-180" style={scallopStyle} />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#6d5141]">
          <span>Romantic Card</span>
          {formattedDate && <span>{formattedDate}</span>}
        </div>

        <div className="space-y-3 font-serif text-[#3f2d25]">
          <p className="text-lg">To: <span className="font-semibold">{noteTo}</span></p>
          <p className="text-lg">From: <span className="font-semibold">{noteFrom}</span></p>
        </div>

        <div
          className="overflow-hidden transition-[max-height] duration-300 ease-out"
          style={{ maxHeight: expanded ? '360px' : '140px' }}
        >
          <p className="text-[17px] leading-relaxed text-[#4b382f] font-serif whitespace-pre-wrap">
            {trimmedMessage}
          </p>
        </div>

        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-[#8a6d5c]">
          <span>{expanded ? 'Tap to collapse' : 'Tap to expand'}</span>
          <span className="text-[#b08a73]">Handwritten Note</span>
        </div>
      </div>
    </button>
  );
}
