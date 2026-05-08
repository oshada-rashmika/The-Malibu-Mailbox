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

interface PlacedItem {
  item: WatercolorFlower;
  left: number;
  top: number;
  rotation: number;
  scale: number;
  zIndex: number;
  seed: number;
}

const buildClusterLayout = (items: WatercolorFlower[]): PlacedItem[] => {
  const centerX = 50;
  const centerY = 50; 
  const goldenAngle = 137.5 * (Math.PI / 180);
  const count = items.length;

  const positions = items.map((item, index) => {
    const seed = hashSeed(item.id ?? `${item.flower_type}-${index}`);
    
    // Spread Radius: position flowers at varying distances (e.g., 5% to 35% offset)
    const t = count > 1 ? index / (count - 1) : 0;
    const radius = 5 + Math.sqrt(t) * 30; // Maps to a radius between 5 and 35
    const angle = index * goldenAngle;
    
    // Add small organic jitter for collision avoidance and natural look
    const jitterX = gaussian(seed + 5, seed + 11) * 2;
    const jitterY = gaussian(seed + 7, seed + 13) * 2;
    
    const xPos = clamp(centerX + Math.cos(angle) * radius + jitterX, 10, 90);
    const yPos = clamp(centerY + Math.sin(angle) * radius + jitterY, 10, 90);
    
    // Randomized Rotation (-25deg to 25deg)
    const rotation = lerp(-25, 25, pseudoRandom(seed + 19));
    
    // Scale variation (overall base scale increased in component rendering)
    const scale = lerp(0.9, 1.3, pseudoRandom(seed + 29));
    
    return { left: xPos, top: yPos, rotation, scale, item, seed, zIndex: 0 };
  });

  // Depth & Layering: Map z-index to distance from center
  // Furthest flowers in the back (lower z-index), central flowers in the front (higher z-index)
  positions.sort((a, b) => {
    const distA = Math.pow(a.left - 50, 2) + Math.pow(a.top - 50, 2);
    const distB = Math.pow(b.left - 50, 2) + Math.pow(b.top - 50, 2);
    return distB - distA; // Descending distance
  });
  
  return positions.map((pos, index) => ({
    ...pos,
    zIndex: 10 + index
  }));
};

export default function WatercolorBouquet({ flowers, className = '' }: WatercolorBouquetProps) {
  // Generate a few filler leaves to intermingle among the flowers
  const leavesCount = Math.max(3, Math.floor(flowers.length / 1.5));
  const fillerLeaves: WatercolorFlower[] = Array.from({ length: leavesCount }).map((_, i) => ({
    id: `filler-leaf-${i}`,
    flower_type: 'leaf',
    x_pos: 0,
    y_pos: 0,
    rotation: 0
  }));
  
  // Combine user flowers with generated filler foliage
  const allItems = [...flowers, ...fillerLeaves];
  
  // Shuffle deterministically to interleave leaves and flowers evenly
  allItems.sort((a, b) => {
    const seedA = hashSeed(a.id ?? a.flower_type);
    const seedB = hashSeed(b.id ?? b.flower_type);
    return seedA - seedB;
  });
  
  // Get balanced spread layout
  const layout = buildClusterLayout(allItems);

  return (
    <div className={`relative w-full aspect-square flex items-center justify-center ${className}`}>
      {/* Foundational Base Layer (Depth) */}
      {/* The background filler leaf acting as the nest, sized to frame the spread */}
      <img
        src="/flowers/leaf.webp"
        alt="Bouquet leaf base"
        className="absolute inset-0 w-full h-full object-contain scale-[1.48] origin-center z-0 opacity-95"
      />

      {/* Intermingled Flowers and Foliage */}
      {layout.map((placement, index) => {
        const { item, left, top, rotation, scale, zIndex, seed } = placement;
        const key = item.id ?? `${item.flower_type}-${index}-${seed}`;
        const isFoliage = item.flower_type === 'leaf';
        
        // Increase base scale of non-foliage flowers significantly. 
        // Intermingled foliage is appropriately sized to fill gaps.
        const widthClass = isFoliage 
          ? "w-[36%] sm:w-[34%] md:w-[32%]" 
          : "w-[28%] sm:w-[25%] md:w-[23%]";

        return (
          <motion.img
            key={key}
            src={`/flowers/${normalizeFlowerType(item.flower_type)}.webp`}
            alt={item.flower_type}
            className={`absolute ${widthClass} object-contain -translate-x-1/2 -translate-y-1/2`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
              rotate: `${rotation}deg`,
              scale,
              zIndex
            }}
            initial={{ opacity: 0, scale: scale * 0.75, y: 15 }}
            animate={{ opacity: 1, scale, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.6, ease: EASE_OUT }}
          />
        );
      })}
    </div>
  );
}
