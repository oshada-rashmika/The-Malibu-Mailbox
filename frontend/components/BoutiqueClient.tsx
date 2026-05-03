'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../utils/api';
import BloomingFlower from './BloomingFlower';
import { motion, AnimatePresence } from 'framer-motion';

interface Flower {
  id: string;
  flower_type: string;
  meaning: string;
  color_hex: string;
  sent_at: string;
}

export default function BoutiqueClient({ userId }: { userId: string }) {
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null);

  useEffect(() => {
    fetchFlowers();
  }, [userId]);

  const fetchFlowers = async () => {
    try {
      const url = `${API_BASE_URL}/api/flowers?user_id=${userId}`;
      console.log(`[Florist] Fetching blooms from: ${url}`);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `System error: ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        console.log(`[Florist] Found ${data.data?.length || 0} blooms.`);
        setFlowers(data.data);
      } else {
        throw new Error(data.message || 'Failed to arrange blooms.');
      }
    } catch (err: any) {
      console.error('[Florist] Bouquet error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center flex-grow h-full">
      <header className="w-full mb-12 pt-6 px-4">
        <div className="relative flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-center">
          <Link
            href="/dashboard"
            className="md:absolute md:left-0 md:top-1/2 md:-translate-y-1/2 text-xs font-semibold tracking-widest uppercase text-deep-velvet/60 hover:text-deep-velvet transition-colors"
          >
            ← Back
          </Link>
          <div className="w-full text-center">
            <h1 className="text-4xl md:text-5xl font-serif text-deep-velvet mb-4">
              Digital Florist
            </h1>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-gold to-transparent mx-auto" />
            <p className="text-deep-velvet/80 italic font-serif text-lg mt-4">
              A curation of your timeless blooms
            </p>
          </div>
        </div>
      </header>

      {/* Main Sandbox for the Bouquet */}
      <div className="flex-1 w-full relative flex flex-col items-center justify-end pb-32">
        {loading ? (
          <div className="animate-pulse space-y-4 flex flex-col items-center">
            <div className="w-32 h-32 bg-white/20 rounded-full blur-xl" />
            <p className="text-deep-velvet/50 text-sm font-serif italic">Arranging your flowers...</p>
          </div>
        ) : flowers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md text-center p-8 bg-white/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] mb-20"
          >
            <p className="text-deep-velvet/70 font-serif italic text-xl mb-4">
              "Your garden is waiting for its first spark of love..."
            </p>
            <div className="pt-4 border-t border-deep-velvet/10">
              <p className="text-[10px] uppercase tracking-widest text-deep-velvet/40 mb-1">Your Recipient ID</p>
              <code className="text-[10px] bg-white/40 px-2 py-1 rounded font-mono text-deep-velvet/60 select-all">
                {userId}
              </code>
              <p className="text-[9px] text-deep-velvet/30 mt-2 italic">
                (Ensure this ID matches exactly when minting flowers in the admin panel)
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="relative flex justify-center items-end h-[300px] w-[300px] sm:w-[400px] mb-8">
            
            {/* The Bouqet grouping */}
            <div className="absolute bottom-16 flex justify-center items-end w-full">
              {flowers.map((flower, i) => {
                // A slight stagger/rotation math to make it look organic
                const middleIndex = (flowers.length - 1) / 2;
                const positionOffset = i - middleIndex;
                
                // Adjust rotation dynamically to fan them out beautifully
                const rotate = positionOffset * 22; 
                
                const translateY = Math.abs(positionOffset) * 10; // dip the outer flowers slightly
                
                // If there are many flowers, make the stems longer dynamically so they fan out beautifully and don't overlap too much
                const overlapFactor = Math.max(0, flowers.length - 3);
                const stemAddedHeight = Math.abs(positionOffset) * 20 + overlapFactor * 15;

                return (
                  <motion.div
                    key={flower.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: translateY }}
                    transition={{ delay: i * 0.15, type: 'spring' }}
                    style={{ 
                      zIndex: flowers.length - Math.abs(positionOffset),
                      position: 'absolute',
                      bottom: 0,
                      // Slight horizontal shift just so perfect overlaps don't look completely rigid
                      x: positionOffset * 15 
                    }}
                    className="origin-bottom transform"
                  >
                    <div style={{ transform: `rotate(${rotate}deg)`, transformOrigin: 'bottom center' }}>
                      <BloomingFlower
                        flowerType={flower.flower_type}
                        meaning={flower.meaning}
                        colorHex={flower.color_hex}
                        stemAddedHeight={stemAddedHeight}
                        onSelect={() => setSelectedFlower(flower)}
                        isSelected={selectedFlower?.id === flower.id}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* The Glassmorphic Vase */}
            <div className="relative z-50 w-48 h-32 rounded-b-[40px] rounded-t-[10px] bg-white/20 backdrop-blur-md border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] flex flex-col justify-end overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-tr before:from-white/40 before:to-transparent before:rounded-b-[40px]">
              {/* Vase Water/Accent bottom */}
              <div className="h-10 w-full bg-cyan-100/10 backdrop-blur-sm border-t border-white/20" />
            </div>
            
          </div>
        )}
      </div>

      {/* Singleton Meaning Overlay */}
      <AnimatePresence mode="wait">
        {selectedFlower && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            {/* Full-screen Dismissal Area */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFlower(null)}
              className="absolute inset-0 bg-black/5 backdrop-blur-sm pointer-events-auto"
            />
            
            {/* The Meaning Card */}
            <motion.div
              key={selectedFlower.id}
              initial={{ opacity: 0, scale: 0.9, x: "-50%", y: "-45%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.9, x: "-50%", y: "-45%" }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/2 left-1/2 w-[90%] max-w-sm md:max-w-md p-10 rounded-[2.5rem] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(224,191,184,0.3)] text-center pointer-events-auto"
            >
              <h3 className="text-4xl md:text-5xl font-serif text-deep-velvet mb-4 capitalize">
                {selectedFlower.flower_type}
              </h3>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-rose-gold to-transparent mx-auto mb-8" />
              <p className="text-xl font-sans text-deep-velvet/80 italic leading-relaxed">
                "{selectedFlower.meaning}"
              </p>
              
              {/* Subtle close button for accessibility */}
              <button 
                onClick={() => setSelectedFlower(null)}
                className="mt-8 text-[10px] uppercase tracking-[0.2em] text-deep-velvet/40 hover:text-deep-velvet/80 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}