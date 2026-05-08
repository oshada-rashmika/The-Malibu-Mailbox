'use client';

import React from 'react';

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

export default function WatercolorBouquet({ flowers, className = '' }: WatercolorBouquetProps) {
  return (
    <div className={`relative w-full aspect-square ${className}`}>
      <img
        src="/flowers/leaf.png"
        alt="Bouquet leaf base"
        className="absolute inset-0 w-full h-full object-contain z-[1]"
      />

      {flowers.map((flower, index) => {
        const key = flower.id ?? `${flower.flower_type}-${index}`;
        const rotation = Number.isFinite(flower.rotation) ? flower.rotation : 0;
        const scale = Number.isFinite(flower.scale) ? flower.scale : 1;
        const zIndex = Number.isFinite(flower.z_index) ? flower.z_index : 2;

        return (
          <img
            key={key}
            src={`/flowers/${normalizeFlowerType(flower.flower_type)}.png`}
            alt={flower.flower_type}
            className="absolute w-[38%] sm:w-[34%] md:w-[32%] lg:w-[30%] object-contain"
            style={{
              left: `${flower.x_pos}%`,
              top: `${flower.y_pos}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
              zIndex
            }}
          />
        );
      })}
    </div>
  );
}
