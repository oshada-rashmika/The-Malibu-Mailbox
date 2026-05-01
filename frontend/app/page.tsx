'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const [isMuted, setIsMuted] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [loadIframe, setLoadIframe] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const buildSrc = (muted: boolean) =>
    `https://www.youtube.com/embed/OJZMmOft_Os?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=OJZMmOft_Os&controls=0&showinfo=0&autohide=1&modestbranding=1&rel=0&playsinline=1&vq=medium`;

  const toggleSound = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (iframeRef.current) {
      iframeRef.current.src = buildSrc(newMuted);
    }
  };

  useEffect(() => {
    // Delay iframe injection until after first paint — page feels instant
    const t = requestIdleCallback
      ? requestIdleCallback(() => setLoadIframe(true))
      : setTimeout(() => setLoadIframe(true), 300);
    return () => {
      if (typeof t === 'number') clearTimeout(t);
    };
  }, []);

  return (
    <main
      className="relative flex flex-col items-center justify-center overflow-hidden"
      style={{ width: '100vw', height: '100dvh' }} // dvh = real mobile height (excludes browser chrome)
    >

      {/* ── Background Layer ── */}
      <div className="absolute inset-0 z-0">

        {/* Overlays */}
        <div className="absolute inset-0 z-20 pointer-events-none bg-black/50" />
        <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-b from-deep-velvet/30 via-transparent to-deep-velvet/70" />

        {/* Static poster — always visible as fallback on slow connections */}
        <img
          src={`https://img.youtube.com/vi/OJZMmOft_Os/maxresdefault.jpg`}
          alt=""
          className="absolute inset-0 w-full h-full object-cover z-[1]"
          fetchPriority="high"
        />

        {/* YouTube iframe — injected after idle, fades in when ready */}
        {loadIframe && (
          <div
            className="absolute z-[10] pointer-events-none"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'max(100vw, 177.78vh)',
              height: 'max(100dvh, 56.25vw)',
              minWidth: '100%',
              minHeight: '100%',
            }}
          >
            <AnimatePresence>
              {videoReady && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.5 }}
                >
                  <iframe
                    ref={iframeRef}
                    src={buildSrc(true)}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="Romantic Background"
                    onLoad={() => setVideoReady(true)}
                    className="w-full h-full"
                    style={{ border: 'none', pointerEvents: 'none' }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Hidden iframe to trigger onLoad */}
            {!videoReady && (
              <iframe
                ref={iframeRef}
                src={buildSrc(true)}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="Romantic Background"
                onLoad={() => setVideoReady(true)}
                className="w-full h-full opacity-0 absolute inset-0"
                style={{ border: 'none', pointerEvents: 'none' }}
              />
            )}
          </div>
        )}
      </div>

      {/* ── Sound Toggle ── */}
      <button
        onClick={toggleSound}
        className="absolute top-5 right-5 z-40 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all duration-300"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-6.414-3H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* ── Content ── */}
      <div className="relative z-30 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
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
            "A digital sanctuary crafted with every heartbeat by{' '}
            <span className="text-rose-gold font-bold not-italic">Oshada Rashmika</span>,
            exclusively for his one and only,{' '}
            <span className="text-rose-gold font-bold not-italic">Senuri Rukshani</span>."
          </p>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-silk-white text-xs md:text-sm font-bold uppercase tracking-[0.3em] shadow-2xl transition-all duration-300 hover:shadow-rose-gold/20"
            >
              Enter Our Sanctuary
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* ── Scroll indicator ── */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center animate-bounce opacity-40">
        <div className="w-px h-12 bg-gradient-to-b from-rose-gold to-transparent" />
      </div>
    </main>
  );
}