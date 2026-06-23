'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

export default function BackgroundLogo() {
  const { theme } = useTheme();

  return (
    <div className="fixed bottom-[-5%] right-[-5%] w-[400px] md:w-[600px] h-auto opacity-[0.05] pointer-events-none select-none z-0">
      {theme === 'barbie' ? (
        <img src="/logo.png" alt="Barbie Logo" className="w-full h-full grayscale brightness-50" />
      ) : (
        <img src="/stitch-logo.png" alt="Stitch Logo" className="w-full h-full grayscale brightness-50" />
      )}
    </div>
  );
}
