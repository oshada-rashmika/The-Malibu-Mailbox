'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '../utils/api';
import WatercolorBouquet, { WatercolorFlower } from './WatercolorBouquet';
import RomanticCard from './RomanticCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Bouquet {
  id: string;
  note_to: string;
  note_from: string;
  message: string;
  created_at: string;
  flowers: WatercolorFlower[];
}

const swipeConfidenceThreshold = 12000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

const wrapIndex = (index: number, total: number) => {
  if (total === 0) return 0;
  return ((index % total) + total) % total;
};

export default function BoutiqueClient({ userId }: { userId: string }) {
  const [bouquets, setBouquets] = useState<Bouquet[]>([]);
  const [loading, setLoading] = useState(true);
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);

  const activeIndex = wrapIndex(page, bouquets.length);
  const activeBouquet = bouquets[activeIndex];
  const hasMultipleBouquets = bouquets.length > 1;

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const url = `${API_BASE_URL}/api/bouquets?user_id=${userId}`;
        console.log(`[Florist] Fetching bouquets from: ${url}`);

        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || `System error: ${res.status}`);
        }

        const data = await res.json();
        if (data.success) {
          const normalized = (data.data || []).map((bouquet: any) => {
            const rawFlowers = bouquet.flowers || bouquet.bouquet_flowers || [];
            const flowers = rawFlowers
              .filter((flower: any) => flower?.flower_type !== 'leaf')
              .map((flower: any) => ({
                ...flower,
                x_pos: Number(flower.x_pos),
                y_pos: Number(flower.y_pos),
                rotation: Number(flower.rotation),
                scale: Number(flower.scale),
                z_index: Number(flower.z_index)
              }))
              .filter((flower: any) => Number.isFinite(flower.x_pos) && Number.isFinite(flower.y_pos));

            return {
              ...bouquet,
              flowers
            } as Bouquet;
          });

          console.log(`[Florist] Found ${normalized.length} bouquet(s).`);
          setBouquets(normalized);
          setPage([0, 0]);
        } else {
          throw new Error(data.message || 'Failed to arrange blooms.');
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[Florist] Bouquet error:', message);
      } finally {
        setLoading(false);
      }
    };

    load();

    return () => controller.abort();
  }, [userId]);

  const paginate = (newDirection: number) => {
    if (!hasMultipleBouquets) return;
    setPage(([current]) => [current + newDirection, newDirection]);
  };


  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center flex-grow h-full">
      {/* ── Header ── */}
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

      {/* ── Bouquet Stage ── */}
      <div className="flex-1 w-full relative flex flex-col items-center justify-center pb-24">
        {loading ? (
          <div className="animate-pulse space-y-4 flex flex-col items-center">
            <div className="w-32 h-32 bg-white/20 rounded-full blur-xl" />
            <p className="text-deep-velvet/50 text-sm font-serif italic">
              Arranging your bouquets...
            </p>
          </div>
        ) : bouquets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md text-center p-8 bg-white/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] mb-20"
          >
            <p className="text-deep-velvet/70 font-serif italic text-xl mb-4">
              &ldquo;Your garden is waiting for its first spark of love...&rdquo;
            </p>
            <div className="pt-4 border-t border-deep-velvet/10">
              <p className="text-[10px] uppercase tracking-widest text-deep-velvet/40 mb-1">
                Your Recipient ID
              </p>
              <code className="text-[10px] bg-white/40 px-2 py-1 rounded font-mono text-deep-velvet/60 select-all">
                {userId}
              </code>
              <p className="text-[9px] text-deep-velvet/30 mt-2 italic">
                (Ensure this ID matches exactly when minting flowers in the admin panel)
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="w-full max-w-5xl mx-auto">
            <div className="relative overflow-hidden rounded-[36px] bg-white/20 backdrop-blur-md border border-white/40 shadow-[0_18px_60px_rgba(31,38,135,0.1)] p-6 sm:p-8">
              <AnimatePresence initial={false} custom={direction} mode="wait">
                <motion.div
                  key={page}
                  custom={direction}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={{
                    enter: (dir: number) => ({
                      x: dir > 0 ? 160 : -160,
                      opacity: 0
                    }),
                    center: { x: 0, opacity: 1 },
                    exit: (dir: number) => ({
                      x: dir < 0 ? 160 : -160,
                      opacity: 0
                    })
                  }}
                  transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                  drag={hasMultipleBouquets ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, { offset, velocity }) => {
                    const swipe = swipePower(offset.x, velocity.x);
                    if (swipe < -swipeConfidenceThreshold) {
                      paginate(1);
                    } else if (swipe > swipeConfidenceThreshold) {
                      paginate(-1);
                    }
                  }}
                  className="w-full"
                >
                  <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:gap-12">
                    <div className="w-full lg:w-3/5">
                      <div className="w-full max-w-md sm:max-w-lg mx-auto">
                        <WatercolorBouquet flowers={activeBouquet.flowers} />
                      </div>
                    </div>
                    <div className="w-full lg:w-2/5">
                      <RomanticCard
                        noteTo={activeBouquet.note_to}
                        noteFrom={activeBouquet.note_from}
                        message={activeBouquet.message}
                        createdAt={activeBouquet.created_at}
                      />
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-deep-velvet/50">
              <span>
                {hasMultipleBouquets
                  ? 'Swipe for next bouquet | Tap card to expand'
                  : 'Tap card to expand'}
              </span>

              {hasMultipleBouquets && (
                <div className="flex items-center gap-2">
                  {bouquets.map((bouquet, index) => (
                    <button
                      key={bouquet.id}
                      type="button"
                      onClick={() => setPage([index, index > activeIndex ? 1 : -1])}
                      className={`h-2 w-2 rounded-full transition-all ${
                        index === activeIndex
                          ? 'bg-rose-gold scale-110'
                          : 'bg-deep-velvet/20 hover:bg-deep-velvet/40'
                      }`}
                      aria-label={`Go to bouquet ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}