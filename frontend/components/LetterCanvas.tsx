'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { v4 as uuidv4 } from 'uuid';
import type { CanvasElement, CanvasElementStyle } from '../types/canvas';

// ─── Constants ────────────────────────────────────────────────────────────────

/** The canonical authoring resolution in pixels. All % values are relative to this. */
const CANVAS_W = 390;
const CANVAS_H = 844; // 9:16 (iPhone 14 Pro logical px)

const ASPECT = CANVAS_H / CANVAS_W; // ~2.165

const DEFAULT_FONTS = [
  'Playfair Display, serif',
  'Georgia, serif',
  'Inter, sans-serif',
  'Dancing Script, cursive',
  'Lora, serif',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert px at canonical size → percentage */
const toPercent = (px: number, axis: 'x' | 'y') =>
  (px / (axis === 'x' ? CANVAS_W : CANVAS_H)) * 100;

/** Convert percentage → px at a given rendered size */
const fromPercent = (pct: number, axis: 'x' | 'y', rendered: { w: number; h: number }) =>
  (pct / 100) * (axis === 'x' ? rendered.w : rendered.h);

// ─── Types ────────────────────────────────────────────────────────────────────

interface LetterCanvasProps {
  elements: CanvasElement[];
  onChange: (elements: CanvasElement[]) => void;
}

// ─── Sub-component: single element renderer inside Rnd ───────────────────────

function ElementContent({ el, scale }: { el: CanvasElement; scale: number }) {
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    fontSize: `${(el.style.fontSize ?? 16) * scale}px`,
    color: el.style.color ?? '#1a1a1a',
    fontFamily: el.style.fontFamily ?? 'Georgia, serif',
    fontWeight: el.style.fontWeight ?? '400',
    textAlign: (el.style.textAlign as React.CSSProperties['textAlign']) ?? 'left',
    opacity: el.style.opacity ?? 1,
    userSelect: 'none',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  };

  if (el.type === 'text') {
    return <div style={style}>{el.content || <span style={{ opacity: 0.3 }}>Type here…</span>}</div>;
  }
  if (el.type === 'image' || el.type === 'sticker') {
    return (
      <img
        src={el.content}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none' }}
        draggable={false}
      />
    );
  }
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LetterCanvas({ elements, onChange }: LetterCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [renderedSize, setRenderedSize] = useState({ w: CANVAS_W, h: CANVAS_H });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ── Zoom-to-fit: measure available space and compute the largest canvas that fits ──
  useEffect(() => {
    const measure = () => {
      if (!wrapperRef.current) return;
      const { width, height } = wrapperRef.current.getBoundingClientRect();
      const fitByWidth = { w: width, h: width * ASPECT };
      const fitByHeight = { w: height / ASPECT, h: height };
      // Pick whichever fits entirely within the wrapper
      const size = fitByWidth.h <= height ? fitByWidth : fitByHeight;
      setRenderedSize({ w: Math.floor(size.w), h: Math.floor(size.h) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    return () => ro.disconnect();
  }, []);

  const scale = renderedSize.w / CANVAS_W; // how much to scale font sizes etc.

  // ── Element mutation helpers ──────────────────────────────────────────────

  const updateElement = useCallback(
    (id: string, patch: Partial<CanvasElement>) => {
      onChange(elements.map((el) => (el.id === id ? { ...el, ...patch } : el)));
    },
    [elements, onChange],
  );

  const addTextElement = () => {
    const el: CanvasElement = {
      id: uuidv4(),
      type: 'text',
      x: 10,   // % from left
      y: 10,   // % from top
      width: 80,
      height: 12,
      rotation: 0,
      content: '',
      style: { fontSize: 18, color: '#3f2d25', fontFamily: 'Playfair Display, serif' },
    };
    onChange([...elements, el]);
    setSelectedId(el.id);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    onChange(elements.filter((el) => el.id !== selectedId));
    setSelectedId(null);
  };

  const selectedEl = elements.find((el) => el.id === selectedId) ?? null;

  // ── Coordinate conversion for Rnd callbacks ───────────────────────────────
  // Rnd gives us px values relative to the rendered canvas — convert to % for storage.

  const handleDragStop = (id: string, _e: unknown, d: { x: number; y: number }) => {
    updateElement(id, {
      x: toPercent(d.x, 'x'),
      y: toPercent(d.y, 'y'),
    });
  };

  const handleResizeStop = (
    id: string,
    _e: unknown,
    _dir: unknown,
    ref: HTMLElement,
    _delta: unknown,
    position: { x: number; y: number },
  ) => {
    updateElement(id, {
      x: toPercent(position.x, 'x'),
      y: toPercent(position.y, 'y'),
      width: toPercent(ref.offsetWidth, 'x'),
      height: toPercent(ref.offsetHeight, 'y'),
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addTextElement}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-gold/10 border border-rose-gold/30 text-rose-gold rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rose-gold hover:text-deep-velvet transition-all"
        >
          <span className="text-base leading-none">T</span> Add Text
        </button>

        {selectedId && (
          <button
            type="button"
            onClick={deleteSelected}
            className="px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
          >
            Delete
          </button>
        )}

        <span className="text-[10px] uppercase tracking-widest text-silk-white/30 ml-auto">
          {renderedSize.w} × {renderedSize.h} px · scale {scale.toFixed(2)}×
        </span>
      </div>

      {/* ── Property Panel (shown when an element is selected) ─────────────── */}
      {selectedEl && selectedEl.type === 'text' && (
        <div className="flex flex-wrap gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in duration-200">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-widest text-rose-gold/60">Content</label>
            <input
              type="text"
              value={selectedEl.content}
              onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
              className="px-3 py-1.5 bg-[#0a0a0a]/60 border border-white/10 rounded-lg text-silk-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-gold/40 min-w-[200px]"
              placeholder="Your text…"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-widest text-rose-gold/60">Font</label>
            <select
              value={selectedEl.style.fontFamily}
              onChange={(e) =>
                updateElement(selectedEl.id, {
                  style: { ...selectedEl.style, fontFamily: e.target.value },
                })
              }
              className="px-3 py-1.5 bg-[#0a0a0a]/60 border border-white/10 rounded-lg text-silk-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-gold/40"
            >
              {DEFAULT_FONTS.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>
                  {f.split(',')[0]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-widest text-rose-gold/60">Size (px)</label>
            <input
              type="number"
              min={8}
              max={120}
              value={selectedEl.style.fontSize ?? 18}
              onChange={(e) =>
                updateElement(selectedEl.id, {
                  style: { ...selectedEl.style, fontSize: Number(e.target.value) },
                })
              }
              className="px-3 py-1.5 bg-[#0a0a0a]/60 border border-white/10 rounded-lg text-silk-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-gold/40 w-20"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-widest text-rose-gold/60">Color</label>
            <input
              type="color"
              value={selectedEl.style.color ?? '#3f2d25'}
              onChange={(e) =>
                updateElement(selectedEl.id, {
                  style: { ...selectedEl.style, color: e.target.value },
                })
              }
              className="w-10 h-9 rounded-lg border border-white/10 bg-transparent cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-widest text-rose-gold/60">Rotation °</label>
            <input
              type="number"
              min={-180}
              max={180}
              value={selectedEl.rotation}
              onChange={(e) => updateElement(selectedEl.id, { rotation: Number(e.target.value) })}
              className="px-3 py-1.5 bg-[#0a0a0a]/60 border border-white/10 rounded-lg text-silk-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-gold/40 w-24"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase tracking-widest text-rose-gold/60">Align</label>
            <div className="flex gap-1">
              {(['left', 'center', 'right'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() =>
                    updateElement(selectedEl.id, {
                      style: { ...selectedEl.style, textAlign: a },
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-widest border transition-all ${
                    (selectedEl.style.textAlign ?? 'left') === a
                      ? 'bg-rose-gold/20 border-rose-gold/40 text-rose-gold'
                      : 'border-white/10 text-silk-white/40 hover:border-white/20'
                  }`}
                >
                  {a[0].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Canvas workspace ────────────────────────────────────────────────── */}
      {/* Outer wrapper fills available width and constrains height so zoom-to-fit can work */}
      <div
        ref={wrapperRef}
        className="w-full flex items-start justify-center"
        style={{ minHeight: 400 }}
      >
        {/* The actual 9:16 phone canvas */}
        <div
          id="letter-canvas"
          onClick={() => setSelectedId(null)}
          style={{
            position: 'relative',
            width: renderedSize.w,
            height: renderedSize.h,
            background: 'linear-gradient(160deg, #fdf6f0 0%, #fae8e0 100%)',
            borderRadius: 24 * scale,
            boxShadow: '0 32px 80px rgba(60,20,10,0.35), 0 0 0 1px rgba(224,191,184,0.2)',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {/* Subtle paper texture */}
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

          {/* Canvas safe-area label */}
          <div
            style={{
              position: 'absolute',
              bottom: 8 * scale,
              right: 12 * scale,
              fontSize: 9 * scale,
              color: 'rgba(63,45,37,0.25)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          >
            390 × 844 canvas
          </div>

          {/* Render elements */}
          {elements.map((el) => {
            const px = fromPercent(el.x, 'x', renderedSize);
            const py = fromPercent(el.y, 'y', renderedSize);
            const pw = fromPercent(el.width, 'x', renderedSize);
            const ph = fromPercent(el.height, 'y', renderedSize);
            const isSelected = el.id === selectedId;

            return (
              <Rnd
                key={el.id}
                position={{ x: px, y: py }}
                size={{ width: pw, height: ph }}
                onDragStop={(e, d) => handleDragStop(el.id, e, d)}
                onResizeStop={(e, dir, ref, delta, pos) =>
                  handleResizeStop(el.id, e, dir, ref, delta, pos)
                }
                bounds="parent"
                style={{
                  transform: `rotate(${el.rotation}deg)`,
                  zIndex: isSelected ? 50 : 10,
                  outline: isSelected
                    ? '2px solid rgba(224,191,184,0.8)'
                    : '1px dashed rgba(224,191,184,0)',
                  outlineOffset: 2,
                  borderRadius: 4,
                  cursor: 'move',
                  transition: 'outline 0.15s',
                }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  setSelectedId(el.id);
                }}
              >
                <ElementContent el={el} scale={scale} />
              </Rnd>
            );
          })}

          {/* Empty state hint */}
          {elements.length === 0 && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 12,
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: 32 * scale, opacity: 0.15 }}>✉</span>
              <p
                style={{
                  fontSize: 11 * scale,
                  color: 'rgba(63,45,37,0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.25em',
                  fontFamily: 'Georgia, serif',
                }}
              >
                Add text to begin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
