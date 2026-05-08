'use client';

import React, { useState } from 'react';
import Envelope from './Envelope';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../utils/api';
import dynamic from 'next/dynamic';

// Lazy-load the canvas renderer (uses ResizeObserver)
const LetterCanvasRenderer = dynamic(() => import('./LetterCanvasRenderer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-white/5 animate-pulse rounded-2xl flex items-center justify-center">
      <span className="text-deep-velvet/20 text-xs uppercase tracking-widest">Loading…</span>
    </div>
  ),
});

interface Letter {
  id: string;
  title: string;
  content: string | any[];
  is_saved?: boolean;
}

interface LetterClientProps {
  letter: Letter | null;
}

/** Type guard: check if letter content is a canvas element array. */
function isCanvasContent(content: unknown): content is any[] {
  return Array.isArray(content);
}

export default function LetterClient({ letter }: LetterClientProps) {
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [isSaved, setIsSaved] = useState(letter?.is_saved || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!letter || isSaved || isSaving) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/letters/${letter.id}/save`, {
        method: 'PATCH',
      });

      const data = await res.json();
      if (data.success) {
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Failed to save letter:', err);
    } finally {
      setIsSaving(false);
    }
  };



  if (!letter) {
    return (
      <div className="w-full text-center p-12 bg-white/30 backdrop-blur-md rounded-3xl border border-white/40 shadow-glass-sm mt-8">
        <p className="text-deep-velvet/60 font-serif italic text-lg">
          The mailbox is currently empty.
        </p>
        <p className="text-[#a57070] text-xs uppercase tracking-widest mt-4">
          Patience, my love.
        </p>
      </div>
    );
  }

  const canvasMode = isCanvasContent(letter.content);

  return (
    <>
      <div className="w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Pass title as prop — no children content rendered inside envelope */}
        <Envelope
          title={letter.title || 'A Letter for You'}
          onLetterClick={() => setIsEnlarged(true)}
        />
      </div>

      <AnimatePresence>
        {isEnlarged && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-deep-velvet/60 backdrop-blur-md"
            onClick={() => setIsEnlarged(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl h-fit max-h-[95vh] bg-silk-white rounded-[2.5rem] shadow-2xl overflow-y-auto overflow-x-hidden custom-scrollbar flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Paper texture overlay */}
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

              <div className="p-6 md:p-10 min-w-0 w-full">
                <header className="text-center mb-8">
                  <span className="text-[9px] uppercase tracking-[0.4em] text-rose-gold/60 mb-2 block font-bold">
                    Today's Letter
                  </span>
                  <h1 className="text-2xl md:text-4xl font-serif text-deep-velvet mb-4 leading-tight break-words">
                    {letter.title || 'A Secret Letter'}
                  </h1>
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-gold/30 to-transparent mx-auto" />
                </header>

                {canvasMode ? (
                  /* Canvas-based letter (CanvasElement[] from JSONB) */
                  <div className="w-full">
                    <LetterCanvasRenderer elements={letter.content as any[]} animated />
                  </div>
                ) : (
                  /* Legacy HTML letter (string content from old Quill editor) */
                  <article
                    className="prose prose-md md:prose-lg prose-rose-gold max-w-none text-deep-velvet font-sans leading-relaxed quill-content pb-4 break-words [overflow-wrap:anywhere]"
                    dangerouslySetInnerHTML={{ __html: letter.content as string }}
                  />
                )}
              </div>

              <footer className="mt-auto p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-rose-gold/10 bg-white/40 backdrop-blur-xl">
                <button
                  onClick={() => setIsEnlarged(false)}
                  className="text-[10px] font-bold uppercase tracking-[0.3em] text-deep-velvet/40 hover:text-deep-velvet transition-colors order-2 sm:order-1"
                >
                  Close Letter
                </button>

                <button 
                  onClick={handleSave}
                  disabled={isSaved || isSaving}
                  className={`flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-500 order-1 sm:order-2 ${isSaved
                      ? 'bg-green-500/10 text-green-600 cursor-default'
                      : isSaving
                      ? 'bg-rose-gold/50 text-deep-velvet cursor-wait'
                      : 'bg-rose-gold text-deep-velvet hover:scale-105 hover:bg-white shadow-lg shadow-rose-gold/20'
                    }`}
                >
                  {isSaved ? (
                    <>
                      <span className="text-base">✓</span>
                      Saved to History
                    </>
                  ) : isSaving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-deep-velvet/30 border-t-deep-velvet rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>❤</span>
                      Save to History
                    </>
                  )}
                </button>

              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}