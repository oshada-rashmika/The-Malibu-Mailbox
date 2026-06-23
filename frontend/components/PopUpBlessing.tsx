'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from './ThemeProvider';

const BLESSINGS = [
  "You are the magic that makes my world bright. ✨",
  "Every moment with you feels like a dream come true. 💖",
  "Your smile is my favorite reason to be happy today. 🌸",
  "I love you more than all the stars in the sky. ⭐",
  "You make ordinary days feel extraordinary. 🎀",
  "Thinking of you is my favorite part of the morning. 🌅",
  "My heart does a little happy dance whenever you're near. 💃",
  "You are the sweetest part of my life. 🍭",
  "Loving you is the easiest thing I've ever done. 🥰",
  "You're my safe place and my favorite adventure. 🗺️",
  "I am so lucky to have you. 🍀",
  "Your laugh is my favorite melody. 🎶",
  "You are the peanut butter to my jelly. 🥜",
  "Every day with you is a new wonderful surprise. 🎁",
  "You light up my life like nobody else. 💡",
  "You have the most beautiful soul. 🦋",
  "I adore everything about you. 💕",
  "You are my today and all of my tomorrows. 📅",
  "Being yours is my greatest blessing. 🙏",
  "You are my favorite notification. 🔔",
  "My day instantly gets better when I talk to you. 📱",
  "You're the missing piece to my puzzle. 🧩",
  "I fall for you more and more every day. 🍂",
  "You're my favorite daydream. ☁️",
  "I could look at you forever and never get tired. 👁️",
  "Your love is my greatest treasure. 💎",
  "You are the sprinkle on my cupcake. 🧁",
  "With you, every season is beautiful. 🌤️",
  "You are my happy place. 🏝️",
  "You make my heart skip a beat. 💓",
  "I cherish every memory we make together. 📸",
  "You're the only one I want to annoy for the rest of my life. 😜",
  "Just a reminder: You are incredibly loved! 💌",
  "You are my forever and always. ♾️",
  "My heart is always with you. ❤️",
  "You make my soul blossom. 🌺",
  "Your kindness makes the world a better place. 🌍",
  "You are a true masterpiece. 🎨",
  "I love you to the moon and back. 🌙",
  "You are the spark that ignites my joy. 🎆",
  "Your hugs are my favorite place to be. 🤗",
  "I am endlessly grateful for your love. 💝",
  "You are my own personal sunshine. ☀️",
  "Every love story is beautiful, but ours is my favorite. 📖",
  "You bring out the best in me. 🌟",
  "You are my perfectly perfect person. 🎀",
  "Your love feels like a warm, cozy blanket. 🧸",
  "You are the dream I never want to wake up from. 😴",
  "My love for you grows stronger with every heartbeat. 💗",
  "You are simply the best thing that ever happened to me. 🏆",
  "To the world you may be one person, but to me you are the world. 🌎",
  "You make every single day brighter. ✨"
];

export default function PopUpBlessing() {
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Generate a new random quote
    const randomQuote = BLESSINGS[Math.floor(Math.random() * BLESSINGS.length)];
    setQuote(randomQuote);

    const todayDateStr = new Date().toDateString();
    const storedDate = localStorage.getItem('lastBlessingDate');
    const storedThemeForPreview = localStorage.getItem('lastPreviewTheme');

    // Trigger logic:
    // 1. First time today
    // 2. Or if the theme changed (preview mode for testing)
    if (storedDate !== todayDateStr || storedThemeForPreview !== theme) {
      setIsVisible(true);
      localStorage.setItem('lastBlessingDate', todayDateStr);
      localStorage.setItem('lastPreviewTheme', theme);
    }
  }, [theme]);

  if (!isVisible) return null;

  const isBarbie = theme === 'barbie';

  // Styling based on active theme
  const containerStyle = isBarbie
    ? 'bg-[#f8c8dc] border-[#8a2be2] text-[#8a2be2]'
    : 'bg-[#a3e4d7] border-[#0e6655] text-[#0e6655]';

  const titleBarStyle = isBarbie
    ? 'bg-[#8a2be2] text-white border-b-4 border-[#4b0082]'
    : 'bg-[#0e6655] text-white border-b-4 border-[#0b5345]';

  const closeButtonIcon = isBarbie ? '💖' : '🌺';

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 100 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
            className={`w-full max-w-sm border-[6px] rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,0.2)] overflow-hidden font-vt323 ${containerStyle}`}
            style={{ fontFamily: 'var(--font-vt323), monospace' }}
          >
            {/* Retro Window Title Bar */}
            <div className={`flex justify-between items-center px-4 py-2 ${titleBarStyle}`}>
              <span className="text-xl tracking-widest uppercase font-bold drop-shadow-md">
                {isBarbie ? 'Message.exe' : 'Aloha.sys'}
              </span>
              <button
                onClick={() => setIsVisible(false)}
                className="text-2xl hover:scale-125 active:scale-90 transition-transform bg-white/20 rounded-md w-8 h-8 flex items-center justify-center border-2 border-transparent hover:border-white/50"
              >
                {closeButtonIcon}
              </button>
            </div>

            {/* Retro Content Area */}
            <div className="p-8 text-center bg-white/40">
              <p className="text-3xl leading-snug drop-shadow-sm">
                "{quote}"
              </p>
              
              <button
                onClick={() => setIsVisible(false)}
                className={`mt-8 px-6 py-2 text-xl uppercase tracking-widest font-bold border-4 shadow-[4px_4px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all ${
                  isBarbie 
                    ? 'bg-[#ff69b4] text-white border-[#8a2be2] hover:bg-[#ff1493]' 
                    : 'bg-[#48c9b0] text-white border-[#0e6655] hover:bg-[#1abc9c]'
                }`}
              >
                OK
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
