'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { CanvasElement } from '../types/canvas';

// ─── Canonical Canvas Size (must match LetterCanvas.tsx exactly) ───────────────
// All CanvasElement positions (x, y, width, height) are stored as percentages
// of this canonical size. The renderer places elements at these percentages of
// 390×844, then the ScaleContainer uses CSS `transform: scale()` to fit the
// entire canvas into whatever space is available — guaranteeing **zero alignment
// change** since no per-element coordinate recalculation happens.

const CANVAS_W = 390;
const CANVAS_H = 844;
const ASPECT = CANVAS_H / CANVAS_W; // ~2.165

// ─── ScaleContainer ───────────────────────────────────────────────────────────

interface ScaleContainerProps {
  children: React.ReactNode;
}

/**
 * Renders its children inside a fixed 390×844 box, then applies
 * `transform: scale(s)` to fit the parent container while maintaining
 * exact relative positions. This is the "Zero Alignment Change" guarantee.
 *
 * How it works:
 *   1. A wrapper div measures its available width/height via ResizeObserver.
 *   2. We compute the uniform scale factor: min(availW / 390, availH / 844).
 *   3. The inner div is always exactly 390×844 px, with transform-origin
 *      at top-left, scaled by that factor.
 *   4. The wrapper's height is set explicitly so it doesn't collapse
 *      (since CSS transforms don't affect layout flow).
 */
function ScaleContainer({ children }: ScaleContainerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    const measure = () => {
      if (!wrapperRef.current) return;
      const { width } = wrapperRef.current.getBoundingClientRect();
      // Scale to fit available width (height is unbounded in most layouts)
      const s = width / CANVAS_W;
      setScaleFactor(s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="w-full flex justify-center"
      style={{
        // Reserve the exact scaled height so the container doesn't collapse.
        // CSS transforms don't affect layout, so we must set this explicitly.
        height: CANVAS_H * scaleFactor,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'top left',
          // Prevent the browser from anti-aliasing text during scaling
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Element Renderer ─────────────────────────────────────────────────────────

function RenderElement({ el, index }: { el: CanvasElement; index: number }) {
  // Convert percentage coords → px at the canonical 390×844 size.
  // No scaling math needed — the ScaleContainer handles display scaling.
  const left = (el.x / 100) * CANVAS_W;
  const top = (el.y / 100) * CANVAS_H;
  const width = (el.width / 100) * CANVAS_W;
  const height = (el.height / 100) * CANVAS_H;

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left,
    top,
    width,
    height,
    transform: `rotate(${el.rotation}deg)`,
    zIndex: index + 1,
    opacity: el.style.opacity ?? 1,
    pointerEvents: 'none',
  };

  if (el.type === 'text') {
    return (
      <div
        key={el.id}
        style={{
          ...baseStyle,
          fontSize: `${el.style.fontSize ?? 16}px`,
          color: el.style.color ?? '#1a1a1a',
          fontFamily: el.style.fontFamily ?? 'Georgia, serif',
          fontWeight: el.style.fontWeight ?? '400',
          textAlign: (el.style.textAlign as React.CSSProperties['textAlign']) ?? 'left',
          overflow: 'hidden',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          userSelect: 'text',
          lineHeight: 1.4,
        }}
      >
        {el.content}
      </div>
    );
  }

  if (el.type === 'image' || el.type === 'sticker') {
    return (
      <img
        key={el.id}
        src={el.content}
        alt=""
        draggable={false}
        style={{
          ...baseStyle,
          objectFit: 'contain',
          userSelect: 'none',
        }}
      />
    );
  }

  return null;
}

// ─── Main Renderer ────────────────────────────────────────────────────────────

interface LetterCanvasRendererProps {
  elements: CanvasElement[];
}

/**
 * Read-only canvas renderer.
 *
 * Renders `CanvasElement[]` at the fixed 390×844 canonical size, then wraps
 * everything in a `ScaleContainer` that uses CSS `transform: scale()` to fit
 * any parent container. Because all elements are positioned at their exact
 * canonical coordinates and a single uniform scale is applied, there is
 * **zero alignment change** between the admin editor and this viewer.
 *
 * The save/load pipeline:
 *   Admin → CanvasElement[] → JSON.stringify → Supabase JSONB `content` column
 *   User  → Supabase JSONB → CanvasElement[] → this renderer
 */
export default function LetterCanvasRenderer({ elements }: LetterCanvasRendererProps) {
  return (
    <ScaleContainer>
      <div
        style={{
          position: 'relative',
          width: CANVAS_W,
          height: CANVAS_H,
          background: 'linear-gradient(160deg, #fdf6f0 0%, #fae8e0 100%)',
          borderRadius: 24,
          boxShadow: '0 16px 60px rgba(60,20,10,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Paper texture */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('https://www.transparenttextures.com/patterns/paper-fibers.png')`,
            opacity: 0.06,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Render elements — array order = z-order */}
        {elements.map((el, index) => (
          <RenderElement key={el.id} el={el} index={index} />
        ))}
      </div>
    </ScaleContainer>
  );
}
