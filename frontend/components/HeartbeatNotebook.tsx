'use client';

import React, { forwardRef, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { motion } from 'framer-motion';

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
  bgElement?: React.ReactNode;
}

const Page = forwardRef<HTMLDivElement, PageProps>(({ children, isCover, bgElement }, ref) => {
  return (
    <div className="page" ref={ref} data-density={isCover ? 'hard' : 'soft'}>
      <div className={`w-full h-full relative shadow-inner overflow-hidden ${
        isCover
          ? 'bg-gradient-to-br from-[#FF69B4] via-[#FF1493] to-[#C71585] border-l-8 border-black/20'
          : 'bg-[#FFFDD0] notebook-lines'
      }`}>
        {isCover ? (
          <>
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/leather.png')]" />
            <img
              src="/barbie.png"
              alt=""
              className="absolute bottom-0 left-0 w-full opacity-30 pointer-events-none object-contain translate-y-2"
            />
          </>
        ) : (
          <>
            <div className="absolute inset-0 opacity-50 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />
            <div className="absolute left-10 top-0 bottom-0 w-[2px] bg-red-400/30" />
            {bgElement}
          </>
        )}

        <div className="h-full w-full flex flex-col relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
});

Page.displayName = 'Page';

const LipIcon = ({ scatterIndex, total }: { scatterIndex: number; total: number }) => {
  const cols = Math.ceil(Math.sqrt(total));
  const col = scatterIndex % cols;
  const row = Math.floor(scatterIndex / cols);

  const baseX = (col - (cols - 1) / 2) * 48;
  const baseY = (row - (Math.ceil(total / cols) - 1) / 2) * 38;

  const jitterX = ((scatterIndex * 17) % 28) - 14;
  const jitterY = ((scatterIndex * 13) % 18) - 9;

  const x = baseX + jitterX;
  const y = baseY + jitterY;
  const rotate = (scatterIndex * 73) % 360;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="absolute pointer-events-none select-none text-2xl"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 15,
        delay: scatterIndex * 0.05,
      }}
    >
      💋
    </motion.div>
  );
};

const getDynamicTextSize = (length: number): string => {
  if (length < 30)  return 'text-4xl leading-snug';
  if (length < 70)  return 'text-3xl leading-snug';
  if (length < 120) return 'text-2xl leading-snug';
  if (length < 200) return 'text-xl leading-snug';
  if (length < 300) return 'text-lg leading-snug';
  if (length < 400) return 'text-base leading-snug';
  return 'text-sm leading-snug';
};

const SENDER_MAP: Record<string, string> = {
  '4245ce5a-0f2a-4716-a2ff-d3993d5a5700': 'Oshada Rashmika',
};

const getSenderName = (senderId: string): string =>
  SENDER_MAP[senderId] ?? 'Senuri Rukshani';

const getKissContainerHeight = (kissCount: number): number => {
  if (kissCount === 0) return 0;
  const cols = Math.ceil(Math.sqrt(kissCount));
  const rows = Math.ceil(kissCount / cols);
  // 38px per row + 28px padding (14px top + 14px bottom jitter buffer)
  return Math.min(rows * 38 + 28, 120);
};

export default function HeartbeatNotebook({
  entries,
  onKiss,
  currentUserId,
}: {
  entries: NotebookEntry[];
  onKiss: (id: string) => void;
  currentUserId: string;
}) {
  const flipBookRef = useRef<{ pageFlip: () => { flipNext: () => void } } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playFlipSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto perspective-[2000px]"
      suppressHydrationWarning
    >
      <audio ref={audioRef} src="/sounds/paper-rustle.mp3" preload="auto" />

      {/* @ts-expect-error — HTMLFlipBook types are incomplete */}
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
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <h1 className="text-4xl font-serif text-white mb-2 drop-shadow-lg tracking-tighter">
              Heartbeat
            </h1>
            <p className="text-rose-gold text-4xl drop-shadow-md font-cursive">
              Notebook
            </p>
            <div className="mt-8 w-12 h-px bg-white/40 mx-auto" />
          </div>
        </Page>

        {/* Introduction Page */}
        <Page
          bgElement={
            <img
              src="/us.png"
              alt=""
              className="absolute bottom-0 left-0 w-full opacity-25 pointer-events-none object-contain translate-y-1"
            />
          }
        >
          <div className="flex-1 flex flex-col justify-center px-10 py-10">
            <div className="text-center space-y-6 relative z-10">
              <h2 className="text-2xl font-serif text-deep-velvet/60 italic">Our Shared Whispers</h2>
              <p className="text-2xl text-deep-velvet/80 leading-relaxed font-cursive">
                &ldquo;Every word here is a heartbeat captured in time. A sanctuary for our
                thoughts, our dreams, and our infinite love.&rdquo;
              </p>
              <div className="text-pink-400 text-3xl animate-pulse">♥</div>
            </div>
          </div>
        </Page>

        {/* Content Pages */}
        {entries.map((entry) => {
          const kissCount = entry.kisses ?? 0;
          const kissHeight = getKissContainerHeight(kissCount);

          return (
            <Page key={entry.id}>
              <div className="flex-1 flex flex-col px-8 py-6 min-h-0">

                {/* Text area — grows to fill space, never overflows */}
                <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
                  <p
                    className={`text-deep-velvet/90 text-center font-cursive ${getDynamicTextSize(
                      entry.content.length
                    )}`}
                  >
                    {entry.content}
                  </p>
                </div>

                {/* Kiss scatter — fixed calculated height, fully visible */}
                {kissCount > 0 && (
                  <div
                    className="relative w-full shrink-0"
                    style={{ height: `${kissHeight}px` }}
                  >
                    {[...Array(kissCount)].map((_, i) => (
                      <LipIcon key={i} scatterIndex={i} total={kissCount} />
                    ))}
                  </div>
                )}

                {/* Footer — always last, never overlapped */}
                <div className="shrink-0 flex items-center justify-between pt-3 border-t border-deep-velvet/10 mt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-deep-velvet/50 font-bold mb-0.5">
                      {getSenderName(entry.sender_id)}
                    </span>
                    <span className="text-[9px] uppercase tracking-widest text-deep-velvet/30 font-bold">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {entry.sender_id !== currentUserId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onKiss(entry.id);
                      }}
                      className="text-[10px] uppercase tracking-tighter text-pink-500 hover:text-pink-700 flex items-center gap-1 font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm active:scale-95 transition-all"
                    >
                      Give a Kiss 💋
                    </button>
                  )}
                </div>

              </div>
            </Page>
          );
        })}

        {/* Final Page */}
        <Page>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-2xl text-deep-velvet/40 italic font-cursive">
              To be continued...
            </p>
          </div>
        </Page>

        {/* Back Cover */}
        <Page isCover={true}>
          <div className="flex-1 flex items-center justify-center opacity-40">
            <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-serif text-xl">M</span>
            </div>
          </div>
        </Page>
      </HTMLFlipBook>
    </div>
  );
}