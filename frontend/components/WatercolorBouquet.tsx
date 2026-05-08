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

const normalizeType = (t: string) => t.trim().toLowerCase();
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const EASE_OUT = [0.18, 1, 0.22, 1] as const;

const rng = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const hashSeed = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 1_000_000;
  return Math.abs(h);
};

// ─── Flower Classification ────────────────────────────────────────────────────
//
// Priority determines z-index: higher = renders on top.
// Wide-headed flowers (rose, sunflower) render on top; tall slim ones behind.

type FlowerClass = 'face' | 'mid' | 'back' | 'leaf';

const FLOWER_CLASS: Record<string, FlowerClass> = {
  rose:      'face',
  sunflower: 'face',
  hibiscus:  'face',
  peony:     'face',
  dahlia:    'face',
  orchid:    'mid',
  lily:      'mid',
  carnation: 'mid',
  tulip:     'back',   // slim — sits behind face flowers
  iris:      'back',
  leaf:      'leaf',
};

const CLASS_Z:     Record<FlowerClass, number>  = { leaf: 5,  back: 12, mid: 18, face: 24 };
// Width as % of the container (these are the actual CSS widths)
const CLASS_W:     Record<FlowerClass, number>  = { face: 28, mid: 24,  back: 22, leaf: 22 };
const CLASS_SCALE: Record<FlowerClass, [number, number]> = {
  face: [0.88, 1.02],
  mid:  [0.82, 0.95],
  back: [0.78, 0.92],
  leaf: [0.82, 0.96],
};

const getClass = (type: string): FlowerClass => FLOWER_CLASS[normalizeType(type)] ?? 'mid';

// ─── Layout ───────────────────────────────────────────────────────────────────

interface PlacedItem {
  item: WatercolorFlower;
  left: number;      // % of container
  top: number;       // % of container
  rotation: number;  // degrees
  scale: number;
  zIndex: number;
  seed: number;
  cls: FlowerClass;
}

/**
 * Places flowers in a natural bouquet arrangement.
 *
 * Key design decisions:
 *
 * 1. SEPARATION: MIN_FLOWER_SEP is sized relative to the actual rendered flower
 *    width so no two flower *heads* completely stack.  The value ~16% gives a
 *    natural ~40% overlap between 28%-wide assets — visually overlapping but
 *    individually readable, matching the reference image.
 *
 * 2. TWO PASSES:
 *    Pass 1 — Flowers (face/mid/back): placed in a tight central cluster via
 *    golden-angle spiral. Anti-clump runs against ALL already-placed flowers
 *    (not just same-class) so heads never fully hide each other.
 *
 *    Pass 2 — Leaves: placed in an outer ring so they peek out around the
 *    flower cluster, exactly like the reference image.
 *
 * 3. Z-INDEX: assigned by class so face flowers always render on top of back
 *    flowers, with leaves always behind everything.
 */
const buildLayout = (
  flowerItems: WatercolorFlower[],
  leafItems: WatercolorFlower[],
): PlacedItem[] => {
  const goldenAngle = 137.507764 * (Math.PI / 180);
  const CX = 50;   // centre %
  const CY = 52;   // slightly below centre for a natural downward-weighted bouquet

  /**
   * Minimum distance between any two flower anchor points.
   * At 16 %, two 28%-wide flowers share ~43% of their width — a natural,
   * reference-quality overlap where each bloom is still clearly readable.
   */
  const MIN_FLOWER_SEP = 16;

  /**
   * Minimum distance between leaf anchors (leaves can overlap each other
   * more freely since they fill the background).
   */
  const MIN_LEAF_SEP = 10;

  const placed: PlacedItem[] = [];

  // ── Pass 1: Place flowers (face / mid / back) ─────────────────────────────
  // Spiral radius grows from 0 →18% as more flowers are added.
  //
  // Top-clamp is PER CLASS because 'back' flowers (tulip, iris) have long stems
  // that extend well below their anchor point. The stem of a tulip can reach
  // ~20% below center, so anchoring at top>56% means the stem exits the leaf.
  //   • 'back' (tulip/iris)  → top max 54%  (stem tip stays ~≤74%)
  //   • 'face'/'mid'         → top max 62%  (compact heads, short stems)
  const TOP_MAX: Record<FlowerClass, number> = {
    face: 62,
    mid:  62,
    back: 54,  // ← key change: tulips must sit higher so stems hide behind leaf base
    leaf: 70,
  };
  const LEFT_MIN = 28;
  const LEFT_MAX = 72;

  flowerItems.forEach((item, i) => {
    const cls  = getClass(item.flower_type);
    const seed = hashSeed(item.id ?? `${item.flower_type}-${i}`);

    const t      = flowerItems.length > 1 ? i / (flowerItems.length - 1) : 0;
    const radius = Math.sqrt(t) * 18; // 0–18% — keeps all flowers deep within the leaf silhouette
    const angle  = i * goldenAngle + rng(seed + 41) * 0.3;

    // Small organic jitter so the grid doesn't look mechanical
    const jx = (rng(seed + 13) - 0.5) * 2.5;
    const jy = (rng(seed + 17) - 0.5) * 2.5;

    let left = CX + Math.cos(angle) * radius + jx;
    let top  = CY + Math.sin(angle) * radius + jy;

    // ── Anti-clump against ALL placed flowers ─────────────────────────────
    // Runs against every already-placed flower regardless of class so no two
    // heads completely overlap.
    for (let attempt = 0; attempt < 30; attempt++) {
      let tooClose = false;
      for (const p of placed) {
        if (p.cls === 'leaf') continue; // leaves don't push flowers apart
        const dx   = left - p.left;
        const dy   = top  - p.top;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MIN_FLOWER_SEP && dist > 0.001) {
          const push = (MIN_FLOWER_SEP - dist) * 0.6;
          left += (dx / dist) * push;
          top  += (dy / dist) * push;
          tooClose = true;
        }
      }
      if (!tooClose) break;
    }

    // ── Stem-aware hard boundary ─────────────────────────────────────────────
    // Applied inside and after the anti-clump loop so no amount of nudging
    // can push a flower (or its stem) outside the leaf silhouette.
    left = clamp(left, LEFT_MIN, LEFT_MAX);
    top  = clamp(top,  28, TOP_MAX[cls]);

    // Tilt each flower toward the centre axis — creates the "gathered" look
    const tiltToCenter = -(left - CX) * 0.55;
    const jitterRot    = lerp(-16, 16, rng(seed + 23));
    const rotation     = clamp(tiltToCenter + jitterRot, -40, 40);

    const [sLo, sHi] = CLASS_SCALE[cls];
    const scale = lerp(sLo, sHi, rng(seed + 29));

    placed.push({ item, left, top, rotation, scale, zIndex: CLASS_Z[cls], seed, cls });
  });

  // ── Pass 2: Place leaves in the outer ring ────────────────────────────────
  // Leaves are positioned at a larger radius (20–38%) so they frame the
  // flower cluster, echoing the reference image.

  const LEAF_MIN_R = 20;
  const LEAF_MAX_R = 38;

  leafItems.forEach((item, i) => {
    const seed   = hashSeed(item.id ?? `filler-leaf-${i}`);
    const t      = leafItems.length > 1 ? i / (leafItems.length - 1) : 0;
    const radius = lerp(LEAF_MIN_R, LEAF_MAX_R, t);
    const angle  = i * goldenAngle * 1.3 + rng(seed + 7) * 0.8; // different spiral from flowers

    const jx = (rng(seed + 31) - 0.5) * 4;
    const jy = (rng(seed + 37) - 0.5) * 4;

    let left = CX + Math.cos(angle) * radius + jx;
    let top  = CY + Math.sin(angle) * radius + jy;

    // Light anti-clump among leaves only
    for (let attempt = 0; attempt < 15; attempt++) {
      let tooClose = false;
      for (const p of placed) {
        if (p.cls !== 'leaf') continue;
        const dx   = left - p.left;
        const dy   = top  - p.top;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MIN_LEAF_SEP && dist > 0.001) {
          const push = (MIN_LEAF_SEP - dist) * 0.5;
          left += (dx / dist) * push;
          top  += (dy / dist) * push;
          tooClose = true;
        }
      }
      if (!tooClose) break;
    }

    left = clamp(left, 10, 90);
    top  = clamp(top,  10, 90);

    // Leaves angle outward from centre — radiating away gives natural look
    const outwardTilt = (left - CX) * 0.8;
    const leafJitter  = lerp(-20, 20, rng(seed + 53));
    const rotation    = clamp(outwardTilt + leafJitter, -50, 50);

    const [sLo, sHi] = CLASS_SCALE['leaf'];
    const scale = lerp(sLo, sHi, rng(seed + 61));

    placed.push({ item, left, top, rotation, scale, zIndex: CLASS_Z['leaf'], seed, cls: 'leaf' });
  });

  return placed;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function WatercolorBouquet({ flowers, className = '' }: WatercolorBouquetProps) {
  // Separate user's flowers from any leaf entries in the data
  const flowerItems = flowers.filter(f => normalizeType(f.flower_type) !== 'leaf');
  const dataLeaves  = flowers.filter(f => normalizeType(f.flower_type) === 'leaf');

  // Add a small number of filler leaves so the outer ring always has greenery,
  // even if the backend sends no leaf entries.
  const fillerCount = Math.max(0, 4 - dataLeaves.length);
  const fillerLeaves: WatercolorFlower[] = Array.from({ length: fillerCount }).map((_, i) => ({
    id: `filler-leaf-${i}`,
    flower_type: 'leaf',
    x_pos: 0,
    y_pos: 0,
    rotation: 0,
  }));

  const leafItems = [...dataLeaves, ...fillerLeaves];
  const layout    = buildLayout(flowerItems, leafItems);

  return (
    <div
      className={`relative w-full aspect-square flex items-center justify-center ${className}`}
    >
      {/* ── Base leaf backdrop (z-0) ─────────────────────────────────────── */}
      {/* The large leaf.webp provides the lush green base and masks stem     */}
      {/* bases. Anchored slightly below center so it frames the arrangement. */}
      <img
        src="/flowers/leaf.webp"
        alt="Bouquet leaf base"
        className="absolute inset-0 w-full h-full object-contain z-0 opacity-95"
        style={{ transform: 'scale(1.4)', transformOrigin: 'center 56%' }}
      />

      {/* ── Flowers & outer foliage ───────────────────────────────────────── */}
      {layout.map((placement, index) => {
        const { item, left, top, rotation, scale, zIndex, seed, cls } = placement;
        const key = item.id ?? `${item.flower_type}-${cls}-${index}-${seed}`;

        return (
          <motion.img
            key={key}
            src={`/flowers/${normalizeType(item.flower_type)}.webp`}
            alt={item.flower_type}
            className="absolute object-contain"
            style={{
              width: `${CLASS_W[cls]}%`,
              left: `${left}%`,
              top: `${top}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
              zIndex,
            }}
            initial={{ opacity: 0, y: 20, scale: scale * 0.6 }}
            animate={{ opacity: 1, y: 0, scale }}
            transition={{
              delay: index * 0.05,
              duration: 0.7,
              ease: EASE_OUT,
            }}
          />
        );
      })}
    </div>
  );
}