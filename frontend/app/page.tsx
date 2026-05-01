'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      {/* Immersive Video Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-black/40 z-10" /> {/* Subtle Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-deep-velvet/30 via-transparent to-deep-velvet/60 z-20" />
        
        <iframe
          className="w-full h-full scale-[1.3] md:scale-[1.1] pointer-events-none object-cover"
          src="https://www.youtube.com/embed/OJZMmOft_Os?autoplay=1&mute=1&loop=1&playlist=OJZMmOft_Os&controls=0&showinfo=0&autohide=1&modestbranding=1&rel=0"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Romantic Background"
        />
      </div>

      {/* Romantic Content Container */}
      <div className="relative z-30 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <span className="text-rose-gold/80 uppercase tracking-[0.4em] text-[10px] md:text-xs font-bold mb-6">
            Welcome to Our Sanctuary
          </span>

          <h1 className="text-5xl md:text-8xl font-serif text-silk-white mb-8 leading-tight drop-shadow-2xl">
            Where Our Forever <br />
            <span className="italic font-serif">Finds a Home</span>
          </h1>

          <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-gold to-transparent mb-8" />

          <p className="text-silk-white/90 font-sans text-sm md:text-lg leading-relaxed max-w-2xl mb-12 italic tracking-wide">
            "A digital sanctuary crafted with every heartbeat by <span className="text-rose-gold font-bold not-italic">Oshada Rashmika</span>, 
            exclusively for his one and only, <span className="text-rose-gold font-bold not-italic">Senuri Rukshani</span>."
          </p>

          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-silk-white text-xs md:text-sm font-bold uppercase tracking-[0.3em] shadow-2xl transition-all duration-300 hover:shadow-rose-gold/20"
            >
              Enter Our Sanctuary
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Ambient glowing embellishment at bottom */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center animate-bounce opacity-40">
        <div className="w-px h-12 bg-gradient-to-b from-rose-gold to-transparent" />
      </div>
    </main>
  );
}
