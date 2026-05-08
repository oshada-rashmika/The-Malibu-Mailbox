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

const normalizeFlowerType = (flowerType: string) => flowerType.trim();

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const EASE_OUT = [0.18, 1, 0.22, 1] as const;

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
};

const lerp = (min: number, max: number, t: number) => min + (max - min) * t;

const hashSeed = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 100000;
  }
  return Math.abs(hash);
};

const gaussian = (seedA: number, seedB: number) => {
  const u = clamp(pseudoRandom(seedA), 0.0001, 0.9999);
  const v = clamp(pseudoRandom(seedB), 0.0001, 0.9999);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

const buildClusterLayout = (flowers: WatercolorFlower[]) => {
  const count = flowers.length;
  const centerX = 50;
  const centerY = 50;
  const maxRadius = 21;
  const goldenAngle = 137.5 * (Math.PI / 180);
  const typeCounts = new Map<string, number>();

  return flowers.map((flower, index) => {
    const typeIndex = typeCounts.get(flower.flower_type) ?? 0;
    typeCounts.set(flower.flower_type, typeIndex + 1);

    const seed = hashSeed(flower.id ?? `${flower.flower_type}-${index}`);
    const t = count > 1 ? (index + 1) / count : 0;
    const radius = Math.sqrt(t) * maxRadius + typeIndex * 2.2;
    const angle = index * goldenAngle + typeIndex * 0.8 + pseudoRandom(seed + 3) * 0.35;
    const jitterX = gaussian(seed + 5, seed + 11) * 3.1;
    const jitterY = gaussian(seed + 7, seed + 13) * 2.7;
    const xPos = clamp(centerX + Math.cos(angle) * radius + jitterX, 26, 74);
    const yPos = clamp(centerY + Math.sin(angle) * radius * 0.88 + jitterY, 28, 76);
    const rotation = lerp(-30, 30, pseudoRandom(seed + 19));
    const scale = lerp(0.7, 1.2, pseudoRandom(seed + 29));

    return {
      left: xPos,
      top: yPos,
      rotation,
      scale,
      zIndex: 10 + index
    };
  });
};

export default function WatercolorBouquet({ flowers, className = '' }: WatercolorBouquetProps) {
  const orderedFlowers = [...flowers];
  const clusterLayout = buildClusterLayout(orderedFlowers);

  return (
    <div className={`relative w-full aspect-square ${className}`}>
      <img
        src="/flowers/leaf.webp"
        alt="Bouquet leaf base"
        className="absolute inset-0 w-full h-full object-contain scale-[1.32] origin-center z-0"
      />

      {orderedFlowers.map((flower, index) => {
        const key = flower.id ?? `${flower.flower_type}-${index}`;
        const placement = clusterLayout[index];
        const rotation = placement?.rotation ?? 0;
        const scale = placement?.scale ?? 1;
        const zIndex = placement?.zIndex ?? index + 1;
        const left = placement?.left ?? 50;
        const top = placement?.top ?? 50;

        return (
          <motion.img
            key={key}
            src={`/flowers/${normalizeFlowerType(flower.flower_type)}.webp`}
            alt={flower.flower_type}
            className="absolute w-[44%] sm:w-[41%] md:w-[38%] lg:w-[36%] object-contain -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              rotate: `${rotation}deg`,
              scale,
              zIndex
            }}
            initial={{ opacity: 0, scale: scale * 0.75, y: 8 }}
            animate={{ opacity: 1, scale, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.5, ease: EASE_OUT }}
          />
        );
      })}
    </div>
  );
}
