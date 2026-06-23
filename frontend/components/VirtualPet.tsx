'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PETS = [
  { id: 'bean', name: 'Bean', src: '/pets/bean.png' },
  { id: 'mochi', name: 'Mochi', src: '/pets/mochi.png' },
  { id: 'cookie', name: 'Cookie', src: '/pets/cookie.png' },
  { id: 'chibi', name: 'Chibi', src: '/pets/chibi.png' },
  { id: 'lola', name: 'Lola', src: '/pets/lola.png' }
];

type PetState = {
  hunger: number;
  happiness: number;
};

type AllPetsState = Record<string, PetState>;

const DEFAULT_STATE: PetState = { hunger: 50, happiness: 50 };

export default function VirtualPet() {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [petStates, setPetStates] = useState<AllPetsState>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [isEating, setIsEating] = useState(false);
  const [isLoved, setIsLoved] = useState(false);

  useEffect(() => {
    // Load from local storage
    const savedStates = localStorage.getItem('virtualPetStates');
    const savedIndex = localStorage.getItem('virtualPetIndex');
    
    if (savedStates) {
      setPetStates(JSON.parse(savedStates));
    } else {
      // Init all to 50
      const initial: AllPetsState = {};
      PETS.forEach(p => initial[p.id] = { ...DEFAULT_STATE });
      setPetStates(initial);
    }

    if (savedIndex) {
      setActiveIndex(parseInt(savedIndex, 10));
    }
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('virtualPetStates', JSON.stringify(petStates));
      localStorage.setItem('virtualPetIndex', activeIndex.toString());
    }
  }, [petStates, activeIndex, isLoaded]);

  const activePet = PETS[activeIndex];
  const currentState = petStates[activePet.id] || DEFAULT_STATE;

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % PETS.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + PETS.length) % PETS.length);

  const feedPet = () => {
    if (isEating || currentState.hunger >= 100) return;
    setIsEating(true);
    setPetStates(prev => ({
      ...prev,
      [activePet.id]: { ...prev[activePet.id], hunger: Math.min(100, prev[activePet.id].hunger + 10) }
    }));
    setTimeout(() => setIsEating(false), 800);
  };

  const lovePet = () => {
    if (isLoved || currentState.happiness >= 100) return;
    setIsLoved(true);
    setPetStates(prev => ({
      ...prev,
      [activePet.id]: { ...prev[activePet.id], happiness: Math.min(100, prev[activePet.id].happiness + 10) }
    }));
    setTimeout(() => setIsLoved(false), 1500);
  };

  if (!isLoaded) return <div className="h-[400px] w-full" />; // placeholder

  const isBarbie = theme === 'barbie';
  const containerBg = isBarbie ? 'bg-[#f8c8dc]' : 'bg-[#a3e4d7]';
  const borderColor = isBarbie ? 'border-[#ff69b4]' : 'border-[#0e6655]';

  return (
    <div className={`w-full max-w-sm mx-auto flex flex-col items-center justify-center p-8 border-[6px] ${borderColor} ${containerBg} shadow-[12px_12px_0px_rgba(0,0,0,0.15)] mb-16 relative font-vt323`}>
      
      {/* Title */}
      <h2 className="text-4xl font-bold uppercase tracking-widest text-deep-velvet mb-6 bg-white px-8 py-2 border-[6px] border-deep-velvet shadow-[6px_6px_0px_rgba(0,0,0,0.15)]">
        {activePet.name}
      </h2>

      {/* Carousel Container */}
      <div className="flex items-center justify-between w-full mb-8">
        <button onClick={handlePrev} className="p-3 border-4 border-deep-velvet bg-white hover:bg-gray-100 active:scale-90 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
          <ChevronLeft size={28} className="text-deep-velvet" />
        </button>

        {/* Pet Avatar */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.img
              key={activePet.id}
              src={activePet.src}
              alt={activePet.name}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isEating ? { scale: [1, 1.15, 0.9, 1.15, 1], y: [0, -15, 0, -15, 0] } : { opacity: 1, scale: 1, y: [0, -8, 0] }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={
                isEating 
                  ? { duration: 0.5, ease: "easeInOut" }
                  : { y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.2 } }
              }
              className="w-full h-full object-contain filter drop-shadow-lg z-10"
              style={{ imageRendering: 'pixelated' }}
            />
          </AnimatePresence>

          {/* Floating Hearts */}
          <AnimatePresence>
            {isLoved && (
              <>
                <motion.div initial={{ opacity: 0, y: 0, x: -20, scale: 0.5 }} animate={{ opacity: 1, y: -70, x: -40, scale: 1.2 }} exit={{ opacity: 0 }} className="absolute text-4xl z-20" style={{ imageRendering: 'pixelated' }}>💖</motion.div>
                <motion.div initial={{ opacity: 0, y: 0, x: 20, scale: 0.5 }} animate={{ opacity: 1, y: -90, x: 40, scale: 1.5 }} exit={{ opacity: 0 }} transition={{ delay: 0.1 }} className="absolute text-5xl z-20" style={{ imageRendering: 'pixelated' }}>💖</motion.div>
                <motion.div initial={{ opacity: 0, y: 0, x: 0, scale: 0.5 }} animate={{ opacity: 1, y: -110, x: 0, scale: 1.3 }} exit={{ opacity: 0 }} transition={{ delay: 0.2 }} className="absolute text-4xl z-20" style={{ imageRendering: 'pixelated' }}>💖</motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button onClick={handleNext} className="p-3 border-4 border-deep-velvet bg-white hover:bg-gray-100 active:scale-90 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.15)]">
          <ChevronRight size={28} className="text-deep-velvet" />
        </button>
      </div>

      {/* Meters */}
      <div className="w-full flex flex-col gap-4 mb-8 bg-white/60 p-5 border-4 border-deep-velvet shadow-inner">
        {/* Happiness Meter */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold w-16 uppercase">Joy</span>
          <div className="flex-1 h-6 bg-white border-[3px] border-deep-velvet overflow-hidden relative">
            <motion.div 
              className={`h-full ${currentState.happiness >= 100 ? 'bg-yellow-400' : 'bg-[#ff69b4]'}`} 
              initial={{ width: 0 }} 
              animate={{ width: `${currentState.happiness}%` }} 
              transition={{ type: 'spring', bounce: 0.5 }}
            />
          </div>
        </div>

        {/* Hunger Meter */}
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold w-16 uppercase">Full</span>
          <div className="flex-1 h-6 bg-white border-[3px] border-deep-velvet overflow-hidden relative">
            <motion.div 
              className={`h-full ${currentState.hunger >= 100 ? 'bg-yellow-400' : 'bg-[#48c9b0]'}`} 
              initial={{ width: 0 }} 
              animate={{ width: `${currentState.hunger}%` }} 
              transition={{ type: 'spring', bounce: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-8">
        <button 
          onClick={feedPet}
          className="w-20 h-20 rounded-full bg-white border-[5px] border-deep-velvet flex items-center justify-center hover:scale-110 active:scale-90 transition-transform shadow-[6px_6px_0px_rgba(0,0,0,0.15)]"
          title="Feed Cookie"
        >
          <img src="/cookie.png" alt="Cookie" className="w-10 h-10 object-contain" style={{ imageRendering: 'pixelated' }} />
        </button>
        <button 
          onClick={lovePet}
          className="w-20 h-20 rounded-full bg-white border-[5px] border-deep-velvet flex items-center justify-center hover:scale-110 active:scale-90 transition-transform shadow-[6px_6px_0px_rgba(0,0,0,0.15)]"
          title="Show Love"
        >
          <img src="/heart.png" alt="Heart" className="w-10 h-10 object-contain" style={{ imageRendering: 'pixelated' }} />
        </button>
      </div>

    </div>
  );
}
