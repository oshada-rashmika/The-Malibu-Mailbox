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
          : 'bg-[#FFFDD0] notebook-lines'
      }`}>
        {/* Leather texture for cover */}
        {isCover && (
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
        )}
        
        {/* Paper texture for inner pages */}
        {!isCover && (
          <>
            <div className="absolute inset-0 opacity-50 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
            <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-red-400/30" />
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
  // Much more aggressive scatter logic to prevent overlap
  const x = (scatterIndex * 47) % 180 - 90; // Spread wide
  const y = (scatterIndex * 31) % 50 - 25; // Spread vertically
  const rotate = (scatterIndex * 60) % 360;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, rotate: rotate - 45 }}
      animate={{ scale: 1.1, opacity: 1, rotate: rotate }}
      className="absolute pointer-events-none text-3xl select-none"
      style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 15, 
        delay: scatterIndex * 0.05 
      }}
    >
      💋
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
  const [mounted, setMounted] = React.useState(false);
  const flipBookRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const playFlipSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto perspective-[2000px]">
      <audio ref={audioRef} src="/sounds/paper-rustle.mp3" preload="auto" />
      
      {/* @ts-ignore */}
      <HTMLFlipBook
        key={entries.length}
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
            <p className="text-rose-gold font-cursive text-4xl drop-shadow-md">
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

        {/* Content Pages - One entry per page */}
        {entries.map((entry) => (
          <Page key={entry.id}>
            <div className="w-full h-full flex flex-col justify-center relative group py-16 px-12">
              <p 
                className="text-3xl text-deep-velvet/90 leading-[32px] mb-6 text-center font-cursive"
              >
                {entry.content}
              </p>
              
              {/* Kiss Reactions Container */}
              <div className="relative h-24 w-full mt-4">
                {[...Array(entry.kisses || 0)].map((_, i) => (
                  <LipIcon key={i} scatterIndex={i} />
                ))}
              </div>

              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-widest text-deep-velvet/50 font-bold mb-0.5">
                    {entry.sender_id === '4245ce5a-0f2a-4716-a2ff-d3993d5a5700' ? 'Oshada Rashmika' : 'Senuri Rukshani'}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-deep-velvet/30 font-bold">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Give a Kiss Button */}
                {entry.sender_id !== currentUserId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onKiss(entry.id);
                    }}
                    className="text-[10px] uppercase tracking-tighter text-pink-500 hover:text-pink-700 transition-colors flex items-center gap-1 font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm"
                  >
                    Give a Kiss 💋
                  </button>
                )}
              </div>
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
