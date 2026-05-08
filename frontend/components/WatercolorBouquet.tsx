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

const bouquetVariants = {
  initial: { opacity: 0, scale: 0.92 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.18, 1, 0.22, 1],
      staggerChildren: 0.06
    }
  }
};

const flowerVariants = {
  initial: { opacity: 0, scale: 0.75 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.18, 1, 0.22, 1] }
  }
};

export default function WatercolorBouquet({ flowers, className = '' }: WatercolorBouquetProps) {
  const orderedFlowers = [...flowers].sort((a, b) => {
    const aIndex = Number.isFinite(a.z_index) ? (a.z_index as number) : 2;
    const bIndex = Number.isFinite(b.z_index) ? (b.z_index as number) : 2;
    return aIndex - bIndex;
  });

  return (
    <motion.div
      className={`relative w-full aspect-square ${className}`}
      variants={bouquetVariants}
      initial="initial"
      animate="animate"
    >
      <motion.img
        src="/flowers/leaf.png"
        alt="Bouquet leaf base"
        className="absolute inset-0 w-full h-full object-contain z-[1]"
        variants={flowerVariants}
      />

      {orderedFlowers.map((flower, index) => {
        const key = flower.id ?? `${flower.flower_type}-${index}`;
        const rotation = Number.isFinite(flower.rotation) ? flower.rotation : 0;
        const scale = Number.isFinite(flower.scale) ? flower.scale : 1;
        const zIndex = Number.isFinite(flower.z_index) ? Math.max(2, flower.z_index as number) : 2;
        const xPos = clamp(flower.x_pos, 0, 100);
        const yPos = clamp(flower.y_pos, 0, 100);

        return (
          <motion.img
            key={key}
            src={`/flowers/${normalizeFlowerType(flower.flower_type)}.png`}
            alt={flower.flower_type}
            className="absolute w-[38%] sm:w-[34%] md:w-[32%] lg:w-[30%] object-contain"
            style={{
              left: `${xPos}%`,
              top: `${yPos}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
              zIndex
            }}
            variants={flowerVariants}
          />
        );
      })}
    </motion.div>
  );
}
