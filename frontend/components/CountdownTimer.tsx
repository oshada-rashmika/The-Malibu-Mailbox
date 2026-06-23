'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

export default function CountdownTimer() {
  const { theme } = useTheme();
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const difference = tomorrow.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 opacity-0 h-[200px]">
        <h3 className="text-rose-gold text-xs uppercase tracking-[0.3em] font-semibold">
          Next Delivery In
        </h3>
      </div>
    );
  }

  const pad = (num: number) => String(num).padStart(2, '0');

  // Floating bob animation
  const floatingVariants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const blockColors = theme === 'barbie' 
    ? 'bg-gradient-to-b from-white to-[#ffb6c1] border-[#ffb6c1]' // Pastel Pink
    : 'bg-gradient-to-b from-white to-[#add8e6] border-[#add8e6]'; // Pastel Blue

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-8 w-full">
      <h3 className="text-deep-velvet/60 text-xs uppercase tracking-[0.3em] font-bold">
        Next delivery in...
      </h3>

      <div className="flex items-center justify-center gap-3 md:gap-6 w-full max-w-lg px-2">
        <motion.div variants={floatingVariants} animate="animate" className="flex flex-col items-center flex-1">
          <div className={`w-full aspect-[3/4] max-h-[140px] flex items-center justify-center rounded-2xl md:rounded-3xl border-b-8 shadow-xl relative overflow-hidden ${blockColors}`}>
            {/* Glossy highlight */}
            <div className="absolute top-0 inset-x-0 h-1/2 bg-white/40 backdrop-blur-sm pointer-events-none" />
            <span className="text-5xl md:text-7xl font-black text-deep-velvet drop-shadow-md z-10">{pad(timeLeft.hours)}</span>
          </div>
          <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-deep-velvet/50 mt-4 bg-white/50 px-3 py-1 rounded-full shadow-sm">Hours</span>
        </motion.div>
        
        <div className="flex flex-col items-center justify-center pb-8">
          <span className="text-deep-velvet/40 text-4xl animate-pulse font-black">:</span>
        </div>

        <motion.div variants={floatingVariants} animate="animate" transition={{ delay: 0.5 }} className="flex flex-col items-center flex-1">
          <div className={`w-full aspect-[3/4] max-h-[140px] flex items-center justify-center rounded-2xl md:rounded-3xl border-b-8 shadow-xl relative overflow-hidden ${blockColors}`}>
             {/* Glossy highlight */}
             <div className="absolute top-0 inset-x-0 h-1/2 bg-white/40 backdrop-blur-sm pointer-events-none" />
            <span className="text-5xl md:text-7xl font-black text-deep-velvet drop-shadow-md z-10">{pad(timeLeft.minutes)}</span>
          </div>
          <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-deep-velvet/50 mt-4 bg-white/50 px-3 py-1 rounded-full shadow-sm">Mins</span>
        </motion.div>

        <div className="flex flex-col items-center justify-center pb-8">
          <span className="text-deep-velvet/40 text-4xl animate-pulse font-black">:</span>
        </div>

        <motion.div variants={floatingVariants} animate="animate" transition={{ delay: 1 }} className="flex flex-col items-center flex-1">
          <div className={`w-full aspect-[3/4] max-h-[140px] flex items-center justify-center rounded-2xl md:rounded-3xl border-b-8 shadow-xl relative overflow-hidden ${blockColors}`}>
             {/* Glossy highlight */}
             <div className="absolute top-0 inset-x-0 h-1/2 bg-white/40 backdrop-blur-sm pointer-events-none" />
            <span className="text-5xl md:text-7xl font-black text-deep-velvet drop-shadow-md z-10">{pad(timeLeft.seconds)}</span>
          </div>
          <span className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-deep-velvet/50 mt-4 bg-white/50 px-3 py-1 rounded-full shadow-sm">Secs</span>
        </motion.div>
      </div>
    </div>
  );
}