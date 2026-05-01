'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface EnvelopeProps {
  children?: React.ReactNode;
}

export default function Envelope({ children }: EnvelopeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div
        className="relative w-[320px] h-[224px] cursor-pointer group mx-auto"
        style={{ perspective: '1200px' }}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-label="Toggle envelope"
      >
        {/* Back of the envelope (inside) */}
        <div className="absolute inset-0 bg-[#d2b0a9] rounded-sm shadow-glass" />

        {/* The Letter */}
        <motion.div
          initial={false}
          animate={{ y: isOpen ? -140 : 0 }}
          transition={{ duration: 0.8, delay: isOpen ? 0.3 : 0, ease: 'backOut' }}
          className="absolute inset-x-4 top-4 bottom-2 bg-silk-white rounded-sm shadow-glass-sm p-6 flex flex-col items-center text-center overflow-hidden z-20"
        >
          <div className="w-full h-full border border-rose-gold/30 rounded flex flex-col items-center justify-center p-4">
            {children || (
              <div className="flex flex-col items-center justify-center opacity-80 mt-2">
                <span className="text-xl font-serif text-deep-velvet italic">A secret letter...</span>
                <div className="h-px w-12 bg-rose-gold/50 my-3" />
                <span className="text-[10px] uppercase tracking-[0.2em] font-sans text-[#a57070]">Tap to discover</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Front of envelope - Bottom & Sides */}
        <div className="absolute inset-0 z-30 pointer-events-none drop-shadow-sm">
          {/* Left flap */}
          <div className="absolute top-0 left-0 w-0 h-0 border-y-[112px] border-y-transparent border-l-[160px] border-l-[#dcb0a7]" />
          
          {/* Right flap */}
          <div className="absolute top-0 right-0 w-0 h-0 border-y-[112px] border-y-transparent border-r-[160px] border-r-[#dcb0a7]" />
          
          {/* Bottom flap */}
          <div className="absolute bottom-0 left-0 w-0 h-0 border-x-[160px] border-x-transparent border-b-[112px] border-b-[#E0BFB8]" />
        </div>

        {/* Top Flap */}
        <motion.div
          initial={false}
          animate={{
            rotateX: isOpen ? 180 : 0,
            zIndex: isOpen ? 10 : 40,
          }}
          transition={{
            rotateX: { duration: 0.5, ease: 'easeInOut' },
            zIndex: { delay: isOpen ? 0.25 : 0.25 },
          }}
          style={{ transformOrigin: 'top' }}
          className="absolute top-0 left-0 w-[320px] h-[112px] origin-top flex drop-shadow-md"
        >
          {/* Drawing the top flap triangle */}
          <div className="w-0 h-0 border-x-[160px] border-x-transparent border-t-[112px] border-t-[#ebd0ca]" />
          
          {/* Decorative wax seal (optional flavor) */}
          <motion.div 
            animate={{ opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[96px] left-[144px] w-8 h-8 rounded-full bg-deep-velvet shadow-xl flex items-center justify-center"
          >
            <span className="text-[10px] text-rose-gold font-serif">M</span>
          </motion.div>
        </motion.div>
      </div>

      <div className="mt-20">
        <p className="text-xs uppercase tracking-[0.2em] text-[#a57070]/70 font-semibold">
          {isOpen ? 'Fold to close' : 'Tap to open'}
        </p>
      </div>
    </div>
  );
}