'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface WatercolorFlower {
  id?: string;
  flower_type: string;
  x_pos: number;
  y_pos: number;
  rotation: number;
  scale?: number;
  z_index?: number;
}

export interface WatercolorBouquetProps {
  flowers: WatercolorFlower[];
  className?: string;
}

// ─── Pure helpers ────────────────────────────────────────────────────────────

const normalizeFlowerType = (t: string) => t.trim();

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const EASE_OUT = [0.18, 1, 0.22, 1] as const;

/** Deterministic pseudo-random [0, 1) from a numeric seed */
const rng = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** String → stable integer seed */
const hashSeed = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1_000_000;
  return Math.abs(h);
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ─── Layout engine ───────────────────────────────────────────────────────────

interface PlacedItem {
  item: WatercolorFlower;
  /** percentage of container width/height */
  left: number;
  top: number;
  rotation: number;
  scale: number;
  zIndex: number;
  seed: number;
}

/**
 * Jittered-sunflower spiral.
 *
 * Flowers are placed on a Fermat spiral (golden-angle phyllotaxis) so they
 * fill the bouquet area organically. Each position is then jittered and
 * clamped so nothing escapes the leafy disc.
 *
 * Minimum-distance enforcement: after placing each flower we check every
 * already-placed flower; if the candidate is too close we nudge it outward
 * along the line connecting the two centres until it clears the threshold.
 */
const buildLayout = (items: WatercolorFlower[], containerPx = 400): PlacedItem[] => {
  const goldenAngle = 137.507764 * (Math.PI / 180);

  /**
   * Usable radius as a % of the container.
   * The leaf.webp lush area occupies roughly the inner 70 % of the square;
   * we spread flowers from 8 % to 38 % from center (i.e. ≤ 38 % radius)
   * so they sit within the green zone.
   */
  const MIN_R = 2;   // % — allows flowers to sit near the true centre
  const MAX_R = 22;  // % — tight mound well inside the leaf silhouette

  /** Minimum separation between flower anchor-points in % units */
  const MIN_SEP_PCT = (30 / containerPx) * 100; // ~7.5 % — allows genuine overlap

  const placed: PlacedItem[] = [];

  items.forEach((item, index) => {
    const seed = hashSeed(item.id ?? `${item.flower_type}-${index}`);

    // Spiral radius grows with sqrt(index) so density is uniform
    const t = items.length > 1 ? index / (items.length - 1) : 0;
    const r = lerp(MIN_R, MAX_R, Math.sqrt(t));
    const angle = index * goldenAngle;

    // Organic jitter ± 4 %
    const jitterMag = lerp(1, 4, rng(seed + 3));
    const jitterAngle = rng(seed + 7) * Math.PI * 2;
    const jx = Math.cos(jitterAngle) * jitterMag;
    const jy = Math.sin(jitterAngle) * jitterMag;

    let left = 50 + Math.cos(angle) * r + jx;
    let top = 50 + Math.sin(angle) * r + jy;

    // ── Anti-clump: nudge away from every already-placed flower ──────────
    let attempts = 0;
    while (attempts < 32) {
      let tooClose = false;
      for (const p of placed) {
        const dx = left - p.left;
        const dy = top - p.top;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MIN_SEP_PCT && dist > 0.001) {
          // Push outward by the deficit
          const deficit = MIN_SEP_PCT - dist;
          left += (dx / dist) * deficit * 0.6;
          top += (dy / dist) * deficit * 0.6;
          tooClose = true;
        }
      }
      if (!tooClose) break;
      attempts++;
    }

    // Keep within the visible leafy disc
    left = clamp(left, 14, 86);
    top = clamp(top, 14, 86);

    // Rotation: −45 … +45°
    const rotation = lerp(-45, 45, rng(seed + 19));

    // Scale: subtle variation — flowers are subordinate to the overall mound
    // Non-foliage flowers: 0.78 – 1.05; foliage: 0.72 – 0.95
    const isLeaf = item.flower_type === 'leaf';
    const scale = isLeaf
      ? lerp(0.72, 0.95, rng(seed + 29))
      : lerp(0.78, 1.05, rng(seed + 29));

    placed.push({ item, left, top, rotation, scale, zIndex: 0, seed });
  });

  // ── Depth layering: items farther from centre render behind closer ones ──
  placed.sort((a, b) => {
    const dA = (a.left - 50) ** 2 + (a.top - 50) ** 2;
    const dB = (b.left - 50) ** 2 + (b.top - 50) ** 2;
    return dB - dA; // descending distance → lower zIndex
  });

  return placed.map((p, i) => ({ ...p, zIndex: 10 + i }));
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function WatercolorBouquet({ flowers, className = '' }: WatercolorBouquetProps) {
  // Generate deterministic filler leaves proportional to flower count
  const leavesCount = Math.max(2, Math.floor(flowers.length / 2));
  const fillerLeaves: WatercolorFlower[] = Array.from({ length: leavesCount }).map((_, i) => ({
    id: `filler-leaf-${i}`,
    flower_type: 'leaf',
    x_pos: 0,
    y_pos: 0,
    rotation: 0,
  }));

  // Interleave leaves and flowers so the layout spreads both evenly
  const allItems: WatercolorFlower[] = [];
  const maxLen = Math.max(flowers.length, fillerLeaves.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < flowers.length) allItems.push(flowers[i]);
    if (i < fillerLeaves.length) allItems.push(fillerLeaves[i]);
  }

  const layout = buildLayout(allItems);

  return (
    <div
      className={`relative w-full aspect-square flex items-center justify-center ${className}`}
    >
      {/* ── Base leaf backdrop ──────────────────────────────────────────── */}
      <img
        src="/flowers/leaf.webp"
        alt="Bouquet leaf base"
        className="absolute inset-0 w-full h-full object-contain z-0 opacity-95"
        style={{ transform: 'scale(1.45)', transformOrigin: 'center' }}
      />

      {/* ── Flowers & foliage ───────────────────────────────────────────── */}
      {layout.map((placement, index) => {
        const { item, left, top, rotation, scale, zIndex, seed } = placement;
        const key = item.id ?? `${item.flower_type}-${index}-${seed}`;
        const isLeaf = item.flower_type === 'leaf';

        /**
         * Width sizing (dense-cluster mode):
         *  • Flowers: 22 % of container — large enough to read clearly but
         *    small enough for 10 blooms to overlap into a mound.
         *  • Leaves: 20 % — fill gaps without overwhelming the flowers.
         *
         * Percentage widths keep the cluster proportional on all screen sizes.
         */
        const widthPct = isLeaf ? '20%' : '22%';

        return (
          <motion.img
            key={key}
            src={`/flowers/${normalizeFlowerType(item.flower_type)}.webp`}
            alt={item.flower_type}
            className="absolute object-contain"
            style={{
              width: widthPct,
              left: `${left}%`,
              top: `${top}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
              zIndex,
            }}
            initial={{ opacity: 0, scale: scale * 0.6, y: 20 }}
            animate={{ opacity: 1, scale, y: 0 }}
            transition={{
              delay: index * 0.05,
              duration: 0.65,
              ease: EASE_OUT,
            }}
          />
        );
      })}
    </div>
  );
}