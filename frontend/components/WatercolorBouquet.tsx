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

const buildClusterLayout = (count: number) => {
  const centerX = 50;
  const centerY = 48;
  const maxRadius = 18;
  const goldenAngle = 137.5 * (Math.PI / 180);

  return Array.from({ length: count }, (_, index) => {
    const t = count > 1 ? index / (count - 1) : 0;
    const radius = Math.sqrt(t) * maxRadius;
    const angle = index * goldenAngle;
    const jitter = (pseudoRandom(index + 1) - 0.5) * 6;
    const xPos = clamp(centerX + Math.cos(angle) * (radius + jitter), 30, 70);
    const yPos = clamp(centerY + Math.sin(angle) * (radius + jitter) * 0.85, 30, 70);
    const rotation = lerp(-15, 15, pseudoRandom(index + 10));
    const scale = lerp(0.9, 1.1, pseudoRandom(index + 20));

    return {
      left: xPos,
      top: yPos,
      rotation,
      scale,
      zIndex: index + 1
    };
  });
};

export default function WatercolorBouquet({ flowers, className = '' }: WatercolorBouquetProps) {
  const orderedFlowers = [...flowers];
  const clusterLayout = buildClusterLayout(orderedFlowers.length);

  return (
    <div className={`relative w-full aspect-square ${className}`}>
      <img
        src="/flowers/leaf.webp"
        alt="Bouquet leaf base"
        className="absolute inset-0 w-full h-full object-contain scale-[1.12] origin-center z-0"
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
            className="absolute w-[42%] sm:w-[40%] md:w-[38%] lg:w-[36%] object-contain -translate-x-1/2 -translate-y-1/2"
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
