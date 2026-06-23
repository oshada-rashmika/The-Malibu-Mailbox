'use client';

import React, { forwardRef, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

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
  const { theme } = useTheme();
  
  const coverColor = theme === 'barbie' ? 'bg-[#ff69b4]' : 'bg-[#1e90ff]';
  const pageColor = 'bg-white'; // pure 2D white

  return (
    <div className="page" ref={ref} data-density={isCover ? 'hard' : 'soft'}>
      <div className={`w-full h-full relative overflow-hidden border-r-4 border-b-4 border-deep-velvet ${
        isCover
          ? `${coverColor} border-l-8 border-deep-velvet`
          : `${pageColor} border-l-4 border-deep-velvet`
      }`}>
        {isCover ? (
          <>
            <img
              src={theme === 'barbie' ? "/barbie.png" : "/stitch-logo.png"}
              alt=""
              className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 opacity-80 pointer-events-none object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </>
        ) : (
          <>
            {bgElement}
          </>
        )}

        <div className="h-full w-full flex flex-col relative z-10 font-vt323">
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
      className="absolute pointer-events-none select-none text-3xl drop-shadow-md"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
        imageRendering: 'pixelated'
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
  if (length < 30)  return 'text-5xl leading-tight';
  if (length < 70)  return 'text-4xl leading-tight';
  if (length < 120) return 'text-3xl leading-tight';
  if (length < 200) return 'text-2xl leading-tight';
  if (length < 300) return 'text-xl leading-tight';
  if (length < 400) return 'text-lg leading-tight';
  return 'text-base leading-tight';
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
        maxShadowOpacity={0.1}
        showCover={true}
        mobileScrollSupport={true}
        onFlip={playFlipSound}
        className="shadow-[12px_12px_0px_rgba(0,0,0,0.15)] bg-white border-[6px] border-deep-velvet"
        ref={flipBookRef}
      >
        {/* Front Cover */}
        <Page isCover={true}>
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <h1 className="text-6xl font-black text-white mb-2 uppercase tracking-widest shadow-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
              Heartbeat
            </h1>
            <p className="text-white text-4xl uppercase tracking-widest font-bold shadow-black drop-shadow-[4px_4px_0px_rgba(0,0,0,0.3)]">
              Notebook
            </p>
            <div className="mt-8 w-24 h-2 bg-white mx-auto border-2 border-deep-velvet" />
          </div>
        </Page>

        {/* Introduction Page */}
        <Page>
          <div className="flex-1 flex flex-col justify-center px-10 py-10">
            <div className="text-center space-y-6 relative z-10">
              <h2 className="text-4xl font-bold text-deep-velvet uppercase tracking-widest">Our Whispers</h2>
              <p className="text-3xl text-deep-velvet leading-relaxed">
                "Every word here is a heartbeat captured in time. A sanctuary for our thoughts, our dreams, and our infinite love."
              </p>
              <div className="text-pink-500 text-5xl" style={{ imageRendering: 'pixelated' }}>♥</div>
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
                    className={`text-deep-velvet text-center font-bold ${getDynamicTextSize(
                      entry.content.length
                    )}`}
                  >
                    {entry.content}
                  </p>
                </div>

                {/* Kiss scatter */}
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

                {/* Footer */}
                <div className="shrink-0 flex items-center justify-between pt-4 border-t-4 border-deep-velvet mt-4">
                  <div className="flex flex-col">
                    <span className="text-sm uppercase tracking-widest text-deep-velvet font-bold mb-1">
                      {getSenderName(entry.sender_id)}
                    </span>
                    <span className="text-xs uppercase tracking-widest text-deep-velvet font-bold opacity-60">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {entry.sender_id !== currentUserId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onKiss(entry.id);
                      }}
                      className="text-sm uppercase tracking-widest text-white hover:bg-[#FF1493] flex items-center gap-1 font-bold bg-[#FF69B4] px-4 py-2 border-2 border-deep-velvet shadow-[2px_2px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all"
                    >
                      KISS 💋
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
            <p className="text-4xl text-deep-velvet opacity-60 uppercase font-bold tracking-widest">
              To be continued...
            </p>
          </div>
        </Page>

        {/* Back Cover */}
        <Page isCover={true}>
          <div className="flex-1 flex items-center justify-center opacity-40">
            <div className="w-20 h-20 border-8 border-white flex items-center justify-center bg-deep-velvet">
              <span className="text-white text-5xl font-bold">M</span>
            </div>
          </div>
        </Page>
      </HTMLFlipBook>
    </div>
  );
}