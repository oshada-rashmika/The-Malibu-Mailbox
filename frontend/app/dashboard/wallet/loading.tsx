import React from 'react';

export default function Loading() {
  return (
    <main className="min-h-screen w-full flex flex-col py-20 px-4 bg-gradient-to-br from-silk-white to-blush-pink relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-rose-gold/20 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blush-pink/40 rounded-full blur-[100px] opacity-50 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        <header className="text-center mb-12 w-full relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-4 bg-rose-gold/30 rounded animate-pulse" />
          <div className="h-10 w-64 bg-deep-velvet/20 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-rose-gold to-transparent mx-auto" />
        </header>

        {/* Tab Switcher Skeleton */}
        <div className="flex p-1 bg-white/40 backdrop-blur-xl border border-white/50 rounded-full shadow-sm mb-12 w-[300px] h-14 animate-pulse" />

        {/* Vouchers Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden p-6 rounded-3xl flex items-center shadow-sm bg-white/40 border border-white/40 backdrop-blur-xl animate-pulse h-[104px]"
            >
              {/* Minimalist Icon Skeleton */}
              <div className="w-14 h-14 shrink-0 rounded-full bg-rose-gold/20 mr-6" />

              <div className="flex-1 min-w-0 space-y-3">
                <div className="h-5 bg-deep-velvet/20 rounded w-3/4" />
                <div className="h-4 bg-deep-velvet/10 rounded w-full" />
                <div className="h-4 bg-deep-velvet/10 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}