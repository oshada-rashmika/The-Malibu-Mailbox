'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CountdownTimer() {
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
      // Next day, 00:00:00 local time
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

    calculateTimeLeft(); // initialize immediately inside useEffect
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  // Avoid hydration mismatch by waiting to render the exact time
  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 opacity-0">
        <h3 className="text-rose-gold text-xs uppercase tracking-[0.3em] font-semibold">
          Next Delivery In
        </h3>
        <div className="flex items-center gap-4 text-deep-velvet font-serif text-5xl md:text-6xl">
          <span>00:00:00</span>
        </div>
      </div>
    );
  }

  const pad = (num: number) => String(num).padStart(2, '0');

  // Gentle, slow breathing animation loop
  const breathingVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      <h3 className="text-[#a57070] text-xs uppercase tracking-[0.3em] font-semibold">
        Next delivery in...
      </h3>

      <div className="flex items-center justify-center gap-4 md:gap-6 text-deep-velvet font-serif text-5xl md:text-7xl">
        <motion.div variants={breathingVariants} animate="animate" className="flex flex-col items-center">
          <span className="drop-shadow-sm">{pad(timeLeft.hours)}</span>
          <span className="text-[10px] md:text-xs font-sans tracking-[0.2em] uppercase text-[#a57070]/70 mt-2">Hours</span>
        </motion.div>
        
        <span className="text-rose-gold/50 -mt-8 animate-pulse">:</span>

        <motion.div variants={breathingVariants} animate="animate" className="flex flex-col items-center">
          <span className="drop-shadow-sm">{pad(timeLeft.minutes)}</span>
          <span className="text-[10px] md:text-xs font-sans tracking-[0.2em] uppercase text-[#a57070]/70 mt-2">Mins</span>
        </motion.div>

        <span className="text-rose-gold/50 -mt-8 animate-pulse">:</span>

        <motion.div variants={breathingVariants} animate="animate" className="flex flex-col items-center">
          <span className="drop-shadow-sm">{pad(timeLeft.seconds)}</span>
          <span className="text-[10px] md:text-xs font-sans tracking-[0.2em] uppercase text-[#a57070]/70 mt-2">Secs</span>
        </motion.div>
      </div>
    </div>
  );
}