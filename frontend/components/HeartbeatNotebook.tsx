'use client';

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { motion, AnimatePresence } from 'framer-motion';

interface NotebookEntry {
  id: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  kisses: number;
}

interface PageProps {
  children: React.ReactNode;
  number?: number;
  isCover?: boolean;
}

const Page = forwardRef<HTMLDivElement, PageProps>(({ children, number, isCover }, ref) => {
  return (
    <div className="page" ref={ref} data-density={isCover ? 'hard' : 'soft'}>
      <div className={`w-full h-full relative shadow-inner overflow-hidden ${
        isCover 
          ? 'bg-gradient-to-br from-[#FF69B4] via-[#FF1493] to-[#C71585] border-l-8 border-black/20' 
          : 'bg-[#FFFDD0] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]'
      }`}>
        {/* Leather texture for cover */}
        {isCover && (
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
        )}
        
        {/* Paper texture for inner pages */}
        {!isCover && (
          <>
            <div className="absolute inset-0 opacity-50 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
            <div className="absolute left-10 top-0 bottom-0 w-px bg-red-200/50" />
          </>
        )}

        <div className="h-full w-full p-10 flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
});

Page.displayName = 'Page';

const LipIcon = ({ scatterIndex }: { scatterIndex: number }) => {
  // Scatter logic
  const x = (scatterIndex % 5) * 15 - 30; // Random-ish horizontal
  const y = Math.floor(scatterIndex / 5) * 15 - 20; // Random-ish vertical
  const rotate = (scatterIndex * 45) % 360;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: rotate - 20 }}
      animate={{ scale: 1, opacity: 1, rotate: rotate }}
      className="absolute pointer-events-none"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(70% + ${y}px)` }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: scatterIndex * 0.1 }}
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
        <path d="M4 14C4 14 6 12 8 12C10 12 11 13 12 13C13 13 14 12 16 12C18 12 20 14 20 14C20 14 19 18 12 18C5 18 4 14 4 14Z" fill="#FF69B4" />
        <path d="M12 13C11 13 10 12 8 12C6 12 4 14 4 14C4 14 5 10 8 9C10 8.5 11 9.5 12 9.5C13 9.5 14 8.5 16 9C19 10 20 14 20 14C20 14 18 12 16 12C14 12 13 13 12 13Z" fill="#FF69B4" />
      </svg>
    </motion.div>
  );
};

export default function HeartbeatNotebook({ 
  entries, 
  onKiss,
  currentUserId 
}: { 
  entries: NotebookEntry[], 
  onKiss: (id: string) => void,
  currentUserId: string
}) {
  const flipBookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playFlipSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  // Group entries into pairs for pages
  const pairedEntries: NotebookEntry[][] = [];
  for (let i = 0; i < entries.length; i += 2) {
    pairedEntries.push(entries.slice(i, i + 2));
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto perspective-[2000px]">
      <audio ref={audioRef} src="/sounds/paper-rustle.mp3" preload="auto" />
      
      {/* @ts-ignore */}
      <HTMLFlipBook
        width={400}
        height={550}
        size="stretch"
        minWidth={300}
        maxWidth={500}
        minHeight={400}
        maxHeight={700}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={playFlipSound}
        className="shadow-2xl rounded-lg overflow-hidden"
        ref={flipBookRef}
      >
        {/* Front Cover */}
        <Page isCover={true}>
          <div className="text-center">
            <h1 className="text-4xl font-serif text-white mb-2 drop-shadow-lg tracking-tighter">
              Heartbeat
            </h1>
            <p className="text-rose-gold font-handwriting text-2xl drop-shadow-md">
              Notebook
            </p>
            <div className="mt-8 w-12 h-px bg-white/40 mx-auto" />
          </div>
        </Page>

        {/* Introduction Page */}
        <Page>
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-serif text-deep-velvet/60 italic">Our Shared Whispers</h2>
            <p className="text-lg font-handwriting text-deep-velvet/80 leading-relaxed">
              "Every word here is a heartbeat captured in time. A sanctuary for our thoughts, our dreams, and our infinite love."
            </p>
            <div className="text-pink-400 text-3xl">♥</div>
          </div>
        </Page>

        {/* Content Pages */}
        {pairedEntries.map((pair, pageIdx) => (
          <Page key={pageIdx}>
            <div className="w-full h-full flex flex-col justify-start space-y-12">
              {pair.map((entry) => (
                <div key={entry.id} className="relative p-6 border-b border-deep-velvet/5 last:border-0 group">
                  <p className="text-xl font-handwriting text-deep-velvet/90 leading-loose mb-6">
                    {entry.content}
                  </p>
                  
                  {/* Kiss Reactions */}
                  <div className="relative h-12 w-full">
                    {[...Array(entry.kisses || 0)].map((_, i) => (
                      <LipIcon key={i} scatterIndex={i} />
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-[10px] uppercase tracking-widest text-deep-velvet/30 font-bold">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                    
                    {/* Give a Kiss Button (only for entries not sent by current user) */}
                    {entry.sender_id !== currentUserId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onKiss(entry.id);
                        }}
                        className="text-[10px] uppercase tracking-tighter text-pink-400 hover:text-pink-600 transition-colors flex items-center gap-1 font-bold"
                      >
                        Give a Kiss 💋
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Page>
        ))}

        {/* Final Page */}
        <Page>
          <div className="text-center">
            <p className="text-lg font-handwriting text-deep-velvet/40 italic">
              To be continued...
            </p>
          </div>
        </Page>

        {/* Back Cover */}
        <Page isCover={true}>
          <div className="opacity-40">
            <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center mx-auto">
              <span className="text-white font-serif text-xl">M</span>
            </div>
          </div>
        </Page>
      </HTMLFlipBook>
    </div>
  );
}
