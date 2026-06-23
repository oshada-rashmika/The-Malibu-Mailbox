'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'barbie' | 'stitch';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('barbie');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // On mount, read from localStorage
    const savedTheme = localStorage.getItem('app-theme') as Theme | null;
    if (savedTheme === 'barbie' || savedTheme === 'stitch') {
      setTheme(savedTheme);
      document.body.classList.remove('theme-barbie', 'theme-stitch');
      document.body.classList.add(`theme-${savedTheme}`);
    } else {
      document.body.classList.add('theme-barbie');
    }
  }, []);

  const toggleTheme = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const nextTheme = theme === 'barbie' ? 'stitch' : 'barbie';

    // Wait half-way through the animation to swap the theme classes underneath
    setTimeout(() => {
      setTheme(nextTheme);
      localStorage.setItem('app-theme', nextTheme);
      document.body.classList.remove('theme-barbie', 'theme-stitch');
      document.body.classList.add(`theme-${nextTheme}`);
    }, 500);

    // End transition
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {/* Magic transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm animate-magic-ripple" />
        </div>
      )}
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
