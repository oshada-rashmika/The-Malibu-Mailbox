'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Letter {
  id: string;
  title: string;
  content: string;
  scheduled_for: string;
  saved_at: string;
}

export default function HistoryClient() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  useEffect(() => {
    fetchLetters();
  }, []);

  const fetchLetters = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/letters/history');
      const data = await res.json();
      if (data.success) {
        setLetters(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`http://localhost:5000/api/letters/${id}/unsave`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (data.success) {
        setLetters((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (err) {
      console.error('Failed to unsave letter:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'UNKNOWN';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }).format(d);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-[3/4] bg-white/20 animate-pulse rounded-sm border border-white/10" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
        <header className="text-center mb-12 w-full relative">
          <Link
            href="/dashboard"
            className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-widest uppercase text-[#a57070] hover:text-deep-velvet transition-colors"
          >
            ← Back
          </Link>
          <h1 className="text-4xl md:text-5xl font-serif text-deep-velvet mb-4">
            Saved Memories
          </h1>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-gold to-transparent mx-auto" />
        </header>

        {letters.length === 0 ? (
          <div className="w-full max-w-md text-center p-12 bg-white/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-glass-sm mt-8">
            <p className="text-deep-velvet/60 font-serif italic text-lg">
              No memories saved yet.
            </p>
            <p className="text-[#a57070] text-xs uppercase tracking-widest mt-4">
              Your story is just beginning.
            </p>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10 w-full"
          >
            <AnimatePresence mode="popLayout">
              {letters.map((letter) => (
                <motion.div
                  key={letter.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                  transition={{ duration: 0.4 }}
                  className="group relative aspect-[3/4] cursor-pointer hover:-translate-y-2 transition-all duration-300 ease-out"
                  onClick={() => setSelectedLetter(letter)}
                >
                  {/* Folded Note Body */}
                  <div
                    className="absolute inset-0 bg-white shadow-md transition-shadow group-hover:shadow-glass-sm"
                    style={{
                      clipPath:
                        'polygon(0 0, calc(100% - 36px) 0, 100% 36px, 100% 100%, 0 100%)',
                    }}
                  >
                    <div className="absolute inset-2 border border-rose-gold/20 rounded-sm" />

                    {/* Unsave Button */}
                    <button
                      onClick={(e) => handleUnsave(e, letter.id)}
                      className="absolute top-2 left-2 z-30 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#a57070] hover:text-red-400"
                      title="Remove from archive"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><line x1="2" y1="2" x2="22" y2="22"/>
                      </svg>
                    </button>

                    {/* Central Date Stamp */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-[3px] border-[#a57070]/30 flex flex-col items-center justify-center transform -rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-500 opacity-60 group-hover:opacity-100 group-hover:border-[#a57070]/60">
                        <span className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-sans text-[#a57070] mb-1">
                          Saved
                        </span>
                        <span className="text-xs md:text-sm font-serif font-bold text-deep-velvet text-center px-2 leading-tight">
                          {formatDate(letter.saved_at || letter.scheduled_for)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Physical Fold Flap */}
                  <div
                    className="absolute top-0 right-0 w-[36px] h-[36px] bg-[#f0e4e1] shadow-[-3px_3px_6px_rgba(0,0,0,0.08)] rounded-bl-lg transform origin-top-right transition-transform group-hover:scale-105"
                  />
                  
                  {/* Title Overlay */}
                  <div className="absolute bottom-6 left-0 right-0 text-center px-4">
                    <span className="text-[10px] md:text-xs font-serif text-deep-velvet/50 truncate block px-2">
                       {letter.title || 'A Memory'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Enlarged Modal View */}
      <AnimatePresence>
        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-deep-velvet/60 backdrop-blur-md"
            onClick={() => setSelectedLetter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl h-fit max-h-[95vh] bg-silk-white rounded-[2.5rem] shadow-2xl overflow-y-auto custom-scrollbar flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
              
              <div className="p-6 md:p-10">
                <header className="text-center mb-8">
                  <span className="text-[9px] uppercase tracking-[0.4em] text-rose-gold/60 mb-2 block font-bold">From the Archives</span>
                  <h1 className="text-2xl md:text-4xl font-serif text-deep-velvet mb-4 leading-tight break-words">
                    {selectedLetter.title || 'A Secret Letter'}
                  </h1>
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-gold/30 to-transparent mx-auto" />
                </header>

                <article 
                  className="prose prose-md md:prose-lg prose-rose-gold max-w-none text-deep-velvet/90 font-sans leading-relaxed quill-content pb-4 break-words [overflow-wrap:anywhere]"
                  dangerouslySetInnerHTML={{ __html: selectedLetter.content }}
                />
              </div>

              <footer className="mt-auto p-6 md:p-8 flex items-center justify-center border-t border-rose-gold/10 bg-white/40 backdrop-blur-xl">
                <button 
                  onClick={() => setSelectedLetter(null)}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-deep-velvet/40 hover:text-deep-velvet transition-colors"
                >
                  Close Memory
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
