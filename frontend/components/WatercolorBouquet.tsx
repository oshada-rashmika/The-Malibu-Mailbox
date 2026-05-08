'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalizeFlowerType = (t: string) => t.trim();
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
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

// ─── Flower Tier Classification ───────────────────────────────────────────────
//
// Tier 1 – FACE flowers: full, wide blooms that sit on top (z 20–30)
// Tier 2 – MID flowers: medium blooms, behind the face layer (z 14–19)
// Tier 3 – BACK flowers: tall/slim stems, tucked deepest (z 10–13)
// Tier 4 – FOLIAGE: leaves, always behind all flowers (z 5–9)

type Tier = 1 | 2 | 3 | 4;

const FLOWER_TIERS: Record<string, Tier> = {
  rose:      1,
  sunflower: 1,
  hibiscus:  1,
  peony:     1,
  dahlia:    1,
  orchid:    2,
  lily:      2,
  carnation: 2,
  tulip:     3,   // ← slim stem, must be tucked behind face flowers
  iris:      3,
  leaf:      4,
};

const getTier = (flowerType: string): Tier => FLOWER_TIERS[flowerType.toLowerCase()] ?? 2;

// ─── Radius Bands per Tier ────────────────────────────────────────────────────
//
// Each tier occupies a DISTINCT radial ring so flowers don't all land at the
// same coordinates. Bands are ordered: face (centre) → mid → back → leaf (edge).
//
//  Tier 1 face:  0–10 %   — dead centre; dominant blooms
//  Tier 2 mid:   8–18 %   — slight overlap with face so they nestle together
//  Tier 3 back:  5–15 %   — tulips tucked behind face blooms
//  Tier 4 leaf: 14–32 %   — outer fringe, clearly outside the flower core

const TIER_RADIUS: Record<Tier, { min: number; max: number }> = {
  1: { min: 0,  max: 10 },
  2: { min: 8,  max: 18 },
  3: { min: 5,  max: 15 },
  4: { min: 14, max: 32 },
};

// Size in % of container width — increased so each flower is clearly readable
const TIER_WIDTH: Record<Tier, string> = {
  1: '30%',
  2: '26%',
  3: '24%',
  4: '22%',
};

// Scale multiplier range
const TIER_SCALE: Record<Tier, [number, number]> = {
  1: [0.90, 1.05],
  2: [0.82, 0.98],
  3: [0.78, 0.94],
  4: [0.80, 0.98],
};

/** Minimum anchor-point separation (% units) to prevent total overlap */
const MIN_SEP_PCT = 10; // ~40 px on a 400 px container

// ─── Layout engine ────────────────────────────────────────────────────────────

interface PlacedItem {
  item: WatercolorFlower;
  left: number;    // % of container
  top: number;     // % of container
  rotation: number; // degrees
  scale: number;
  zIndex: number;
  seed: number;
  tier: Tier;
}

/**
 * Builds a hand-tied bouquet layout.
 *
 * Approach:
 *  1. Classify every flower into a semantic tier.
 *  2. Assign a radius band based on tier (face = centre, foliage = edge).
 *  3. Place items using a golden-angle spiral within their band.
 *  4. Apply a "gathered" rotation: each flower rotates ± up to 28° toward the
 *     vertical centre axis so they feel hand-tied, not fanned out.
 *  5. Sort and assign z-indices by tier (Tier 1 on top).
 */
const buildLayout = (items: WatercolorFlower[]): PlacedItem[] => {
  const goldenAngle = 137.507764 * (Math.PI / 180);
  const CX = 50; // centre x %
  const CY = 50; // centre y %

  // Counters per tier to generate distinct angles within the band
  const tierCounts: Record<Tier, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

  const placed: PlacedItem[] = items.map((item) => {
    const tier = getTier(normalizeFlowerType(item.flower_type));
    const idx  = tierCounts[tier]++;
    const seed = hashSeed(item.id ?? `${item.flower_type}-${tier}-${idx}`);

    // Position within the tier's radius band
    const band   = TIER_RADIUS[tier];
    const t      = rng(seed + 1); // 0–1, unique per flower
    const radius = lerp(band.min, band.max, t);
    const angle  = idx * goldenAngle + rng(seed + 41) * 0.5; // slight angle jitter

    // Organic positional jitter (keeps things from looking mechanical)
    const jx = (rng(seed + 13) - 0.5) * 3.5;
    const jy = (rng(seed + 17) - 0.5) * 3.5;

    let left = clamp(CX + Math.cos(angle) * radius + jx, 14, 86);
    let top  = clamp(CY + Math.sin(angle) * radius + jy, 14, 86);

    // ── Anti-clump: nudge away from every already-placed flower ─────────────
    // Only run for same-tier neighbours — we WANT cross-tier overlap (depth).
    // Up to 20 iterations is enough to resolve dense packs.
    let attempts = 0;
    while (attempts < 20) {
      let tooClose = false;
      for (const p of placed) {
        if (p.tier !== tier) continue; // cross-tier overlap is intentional
        const dx   = left - p.left;
        const dy   = top  - p.top;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MIN_SEP_PCT && dist > 0.001) {
          const push = (MIN_SEP_PCT - dist) * 0.55;
          left += (dx / dist) * push;
          top  += (dy / dist) * push;
          tooClose = true;
        }
      }
      if (!tooClose) break;
      attempts++;
    }
    left = clamp(left, 14, 86);
    top  = clamp(top,  14, 86);

    // "Gathered" rotation: tilt toward centre axis ± jitter
    const tiltToCenter = -(left - CX) * 0.50;
    const jitterRot    = lerp(-14, 14, rng(seed + 23));
    const rotation     = clamp(tiltToCenter + jitterRot, -38, 38);

    const scaleBand = TIER_SCALE[tier];
    const scale     = lerp(scaleBand[0], scaleBand[1], rng(seed + 29));

    return { item, left, top, rotation, scale, zIndex: 0, seed, tier };
  });

  // ── Assign z-indices by tier (Tier 1 = highest, Tier 4 = lowest) ──────────
  // Within each tier, items placed more centrally render above peripheral ones.
  placed.sort((a, b) => {
    // Primary: tier (lower tier number = in front)
    if (a.tier !== b.tier) return b.tier - a.tier; // Tier 4 first (pushed back)
    // Secondary: distance from centre (closer = in front within same tier)
    const dA = (a.left - CX) ** 2 + (a.top - CY) ** 2;
    const dB = (b.left - CX) ** 2 + (b.top - CY) ** 2;
    return dB - dA; // farther → lower z-index
  });

  // Z-index assignment:
  //  Tier 4 (foliage) →  z 5–9
  //  Tier 3 (tulips)  → z 10–14
  //  Tier 2 (mid)     → z 15–19
  //  Tier 1 (face)    → z 20+
  const tierBaseZ: Record<Tier, number> = { 4: 5, 3: 10, 2: 15, 1: 20 };
  const tierItemIdx: Record<Tier, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };

  return placed.map((p) => {
    const base = tierBaseZ[p.tier];
    const z    = base + tierItemIdx[p.tier];
    tierItemIdx[p.tier]++;
    return { ...p, zIndex: z };
  });
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function WatercolorBouquet({ flowers, className = '' }: WatercolorBouquetProps) {
  // Filler leaves: 2–5 extra leaf elements to fill gaps and mask stem bases
  const leavesCount = clamp(Math.floor(flowers.length / 2), 2, 5);
  const fillerLeaves: WatercolorFlower[] = Array.from({ length: leavesCount }).map((_, i) => ({
    id: `filler-leaf-${i}`,
    flower_type: 'leaf',
    x_pos: 0,
    y_pos: 0,
    rotation: 0,
  }));

  // Interleave: flower, leaf, flower, leaf … for even distribution
  const allItems: WatercolorFlower[] = [];
  const maxLen = Math.max(flowers.length, fillerLeaves.length);
  for (let i = 0; i < maxLen; i++) {
    if (i < flowers.length)   allItems.push(flowers[i]);
    if (i < fillerLeaves.length) allItems.push(fillerLeaves[i]);
  }

  const layout = buildLayout(allItems);

  return (
    <div
      className={`relative w-full aspect-square flex items-center justify-center ${className}`}
    >
      {/* ── Base leaf backdrop (z-0) — the "nest" ─────────────────────────── */}
      {/* Scaled up so leaves extend beyond the tight flower mound and mask     */}
      {/* where stems converge at the base of the arrangement.                  */}
      <img
        src="/flowers/leaf.webp"
        alt="Bouquet leaf base"
        className="absolute inset-0 w-full h-full object-contain z-0 opacity-97"
        style={{ transform: 'scale(1.42)', transformOrigin: 'center 55%' }}
      />

      {/* ── Flowers & foliage (z 5–30+) ───────────────────────────────────── */}
      {layout.map((placement, index) => {
        const { item, left, top, rotation, scale, zIndex, seed, tier } = placement;
        const key = item.id ?? `${item.flower_type}-${tier}-${index}-${seed}`;

        return (
          <motion.img
            key={key}
            src={`/flowers/${normalizeFlowerType(item.flower_type)}.webp`}
            alt={item.flower_type}
            className="absolute object-contain"
            style={{
              width: TIER_WIDTH[tier],
              left: `${left}%`,
              top: `${top}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
              zIndex,
            }}
            initial={{ opacity: 0, y: 18, scale: scale * 0.65 }}
            animate={{ opacity: 1, y: 0, scale }}
            transition={{
              delay: index * 0.045,
              duration: 0.7,
              ease: EASE_OUT,
            }}
          />
        );
      })}

      {/* ── Stem-masking foliage overlay (z-4) ────────────────────────────── */}
      {/* A second, slightly smaller leaf image anchored to the lower-centre   */}
      {/* covers the base of all stems before they exit the bouquet.            */}
      <img
        src="/flowers/leaf.webp"
        alt=""
        aria-hidden="true"
        className="absolute object-contain pointer-events-none"
        style={{
          width: '55%',
          left: '50%',
          top: '62%',
          transform: 'translate(-50%, -50%) scale(0.72)',
          transformOrigin: 'center bottom',
          zIndex: 4,
          opacity: 0.88,
        }}
      />
    </div>
  );
}