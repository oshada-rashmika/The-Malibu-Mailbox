'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { CanvasElement } from '../types/canvas';

// ─── Constants (must mirror LetterCanvas.tsx exactly) ─────────────────────────

const CANVAS_W = 390;
const CANVAS_H = 844;
const ASPECT = CANVAS_H / CANVAS_W;

/** Convert percentage → px at a given rendered size */
const fromPercent = (pct: number, axis: 'x' | 'y', rendered: { w: number; h: number }) =>
  (pct / 100) * (axis === 'x' ? rendered.w : rendered.h);

// ─── Read-only Canvas Renderer ────────────────────────────────────────────────

interface LetterCanvasRendererProps {
  elements: CanvasElement[];
}

/**
 * Renders a `CanvasElement[]` as a read-only, pixel-perfect replica
 * of the admin canvas editor. Uses the same coordinate math, font
 * scaling, and aspect ratio so there is **zero alignment change**
 * between the admin authoring view and the user reading view.
 */
export default function LetterCanvasRenderer({ elements }: LetterCanvasRendererProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [renderedSize, setRenderedSize] = useState({ w: CANVAS_W, h: CANVAS_H });

  // ── Zoom-to-fit (identical to LetterCanvas) ─────────────────────────────
  useEffect(() => {
    const measure = () => {
      if (!wrapperRef.current) return;
      const { width, height } = wrapperRef.current.getBoundingClientRect();
      const fitByWidth = { w: width, h: width * ASPECT };
      const fitByHeight = { w: height / ASPECT, h: height };
      const size = fitByWidth.h <= height ? fitByWidth : fitByHeight;
      setRenderedSize({ w: Math.floor(size.w), h: Math.floor(size.h) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const scale = renderedSize.w / CANVAS_W;

  return (
    <div
      ref={wrapperRef}
      className="w-full flex items-center justify-center"
      style={{ minHeight: 200 }}
    >
      <div
        style={{
          position: 'relative',
          width: renderedSize.w,
          height: renderedSize.h,
          background: 'linear-gradient(160deg, #fdf6f0 0%, #fae8e0 100%)',
          borderRadius: 24 * scale,
          boxShadow: '0 16px 60px rgba(60,20,10,0.2)',
          overflow: 'hidden',
          flexShrink: 0,
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
        {elements.map((el, index) => {
          const px = fromPercent(el.x, 'x', renderedSize);
          const py = fromPercent(el.y, 'y', renderedSize);
          const pw = fromPercent(el.width, 'x', renderedSize);
          const ph = fromPercent(el.height, 'y', renderedSize);

          if (el.type === 'text') {
            return (
              <div
                key={el.id}
                style={{
                  position: 'absolute',
                  left: px,
                  top: py,
                  width: pw,
                  height: ph,
                  transform: `rotate(${el.rotation}deg)`,
                  zIndex: index + 1,
                  fontSize: `${(el.style.fontSize ?? 16) * scale}px`,
                  color: el.style.color ?? '#1a1a1a',
                  fontFamily: el.style.fontFamily ?? 'Georgia, serif',
                  fontWeight: el.style.fontWeight ?? '400',
                  textAlign: (el.style.textAlign as React.CSSProperties['textAlign']) ?? 'left',
                  opacity: el.style.opacity ?? 1,
                  overflow: 'hidden',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  pointerEvents: 'none',
                  userSelect: 'text',
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
                  position: 'absolute',
                  left: px,
                  top: py,
                  width: pw,
                  height: ph,
                  transform: `rotate(${el.rotation}deg)`,
                  zIndex: index + 1,
                  objectFit: 'contain',
                  opacity: el.style.opacity ?? 1,
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
