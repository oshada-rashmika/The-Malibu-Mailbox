'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { v4 as uuidv4 } from 'uuid';
import type { CanvasElement, CanvasElementStyle } from '../types/canvas';
import { uploadCanvasAsset } from '../utils/canvasUpload';

// ─── Constants ────────────────────────────────────────────────────────────────

/** The canonical authoring resolution in pixels. All % values are relative to this. */
const CANVAS_W = 390;
const CANVAS_H = 844; // 9:16 (iPhone 14 Pro logical px)

const ASPECT = CANVAS_H / CANVAS_W; // ~2.165

/** Curated list of romantic / serif / display fonts for the text toolbar. */
const FONT_LIST = [
  { label: 'Playfair Display', value: 'Playfair Display, serif' },
  { label: 'Cormorant Garamond', value: 'Cormorant Garamond, serif' },
  { label: 'Lora', value: 'Lora, serif' },
  { label: 'EB Garamond', value: 'EB Garamond, serif' },
  { label: 'Libre Baskerville', value: 'Libre Baskerville, serif' },
  { label: 'Great Vibes', value: 'Great Vibes, cursive' },
  { label: 'Dancing Script', value: 'Dancing Script, cursive' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
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

// ─── Toast Component ──────────────────────────────────────────────────────────

function CanvasToast({ message, isError, onDismiss }: { message: string; isError: boolean; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl border animate-in fade-in slide-in-from-bottom-4 duration-300 ${
        isError
          ? 'bg-red-500/90 text-white border-red-400/40'
          : 'bg-rose-gold text-deep-velvet border-white/20 shadow-rose-gold/40'
      }`}
    >
      {message}
    </div>
  );
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
    fontStyle: el.style.fontStyle ?? 'normal',
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

// ─── Floating Text Toolbar ───────────────────────────────────────────────────

interface FloatingToolbarProps {
  el: CanvasElement;
  renderedSize: { w: number; h: number };
  scale: number;
  onUpdate: (id: string, patch: Partial<CanvasElement>) => void;
}

function FloatingElementToolbar({ el, renderedSize, scale, onUpdate }: FloatingToolbarProps) {
  const elTop = fromPercent(el.y, 'y', renderedSize);
  const elLeft = fromPercent(el.x, 'x', renderedSize);
  const elWidth = fromPercent(el.width, 'x', renderedSize);

  // Position toolbar above the element, or below if too close to the top
  const toolbarAbove = elTop > 160 * scale;
  const top = toolbarAbove ? elTop - 8 : elTop + fromPercent(el.height, 'y', renderedSize) + 8;

  return (
    <div
      className="absolute z-[60] animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{
        top,
        left: Math.max(0, Math.min(elLeft, renderedSize.w - 360)),
        minWidth: Math.min(360, renderedSize.w),
        transform: toolbarAbove ? 'translateY(-100%)' : 'translateY(0)',
        pointerEvents: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-3 shadow-2xl shadow-black/40">
        {/* Row 1: Content input */}
        {el.type === 'text' && (
          <div className="mb-2.5">
            <textarea
              value={el.content}
              onChange={(e) => onUpdate(el.id, { content: e.target.value })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-silk-white text-sm focus:outline-none focus:ring-1 focus:ring-rose-gold/50 placeholder:text-silk-white/20 resize-none"
              placeholder="Your text…"
              rows={3}
            />
          </div>
        )}

        {/* Row 2: Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {el.type === 'text' && (
            <>
          {/* Font Family */}
          <select
            value={el.style.fontFamily ?? 'Georgia, serif'}
            onChange={(e) =>
              onUpdate(el.id, {
                style: { ...el.style, fontFamily: e.target.value },
              })
            }
            className="px-2 py-1.5 bg-white/5 border border-white/10 rounded-lg text-silk-white text-[11px] focus:outline-none focus:ring-1 focus:ring-rose-gold/40 max-w-[140px]"
          >
            {FONT_LIST.map((f) => (
              <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Font Size */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5">
            <button
              type="button"
              onClick={() =>
                onUpdate(el.id, {
                  style: { ...el.style, fontSize: Math.max(8, (el.style.fontSize ?? 18) - 1) },
                })
              }
              className="text-silk-white/60 hover:text-silk-white text-sm px-1 py-0.5 transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min={8}
              max={120}
              value={el.style.fontSize ?? 18}
              onChange={(e) =>
                onUpdate(el.id, {
                  style: { ...el.style, fontSize: Number(e.target.value) },
                })
              }
              className="w-10 text-center bg-transparent text-silk-white text-[11px] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() =>
                onUpdate(el.id, {
                  style: { ...el.style, fontSize: Math.min(120, (el.style.fontSize ?? 18) + 1) },
                })
              }
              className="text-silk-white/60 hover:text-silk-white text-sm px-1 py-0.5 transition-colors"
            >
              +
            </button>
          </div>

          {/* Color Picker */}
          <div className="relative">
            <input
              type="color"
              value={el.style.color ?? '#3f2d25'}
              onChange={(e) =>
                onUpdate(el.id, {
                  style: { ...el.style, color: e.target.value },
                })
              }
              className="w-8 h-8 rounded-lg border border-white/10 bg-transparent cursor-pointer [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
            />
          </div>

          {/* Alignment */}
          <div className="flex gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() =>
                  onUpdate(el.id, {
                    style: { ...el.style, textAlign: a },
                  })
                }
                className={`px-2 py-1 rounded-md text-[10px] uppercase tracking-wider transition-all ${
                  (el.style.textAlign ?? 'left') === a
                    ? 'bg-rose-gold/25 text-rose-gold'
                    : 'text-silk-white/40 hover:text-silk-white/70'
                }`}
              >
                {a === 'left' ? '⫷' : a === 'center' ? '☰' : '⫸'}
              </button>
            ))}
          </div>

          {/* Formatting */}
          <div className="flex gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() =>
                onUpdate(el.id, {
                  style: { ...el.style, fontWeight: el.style.fontWeight === 'bold' ? '400' : 'bold' },
                })
              }
              className={`px-2 py-1 rounded-md text-[11px] font-bold transition-all ${
                el.style.fontWeight === 'bold'
                  ? 'bg-rose-gold/25 text-rose-gold'
                  : 'text-silk-white/40 hover:text-silk-white/70'
              }`}
            >
              B
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdate(el.id, {
                  style: { ...el.style, fontStyle: el.style.fontStyle === 'italic' ? 'normal' : 'italic' },
                })
              }
              className={`px-2 py-1 rounded-md text-[11px] italic transition-all ${
                el.style.fontStyle === 'italic'
                  ? 'bg-rose-gold/25 text-rose-gold'
                  : 'text-silk-white/40 hover:text-silk-white/70'
              }`}
            >
              I
            </button>
          </div>
          )}

          {/* Rotation */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
            <span className="text-[9px] text-silk-white/40">°</span>
            <input
              type="number"
              min={-180}
              max={180}
              value={el.rotation}
              onChange={(e) => onUpdate(el.id, { rotation: Number(e.target.value) })}
              className="w-10 text-center bg-transparent text-silk-white text-[11px] focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LetterCanvas({ elements, onChange }: LetterCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [renderedSize, setRenderedSize] = useState({ w: CANVAS_W, h: CANVAS_H });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);
  const [uploading, setUploading] = useState(false);

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

  // ── Upload handler ────────────────────────────────────────────────────────

  const handleFileUpload = async (file: File, type: 'sticker' | 'image') => {
    setUploading(true);
    try {
      const { url } = await uploadCanvasAsset(file, type);
      const el: CanvasElement = {
        id: uuidv4(),
        type,
        x: 25,
        y: 30,
        width: 50,
        height: type === 'sticker' ? 15 : 25,
        rotation: 0,
        content: url,
        style: { opacity: 1 },
      };
      onChange([...elements, el]);
      setSelectedId(el.id);
      setToast({ message: `${type === 'sticker' ? 'Sticker' : 'Image'} added to canvas ✨`, isError: false });
    } catch (err: any) {
      setToast({ message: err.message || 'Upload failed', isError: true });
    } finally {
      setUploading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'sticker' | 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset so same file can be re-selected
    handleFileUpload(file, type);
  };

  // ── Layering ──────────────────────────────────────────────────────────────

  const bringToFront = () => {
    if (!selectedId) return;
    const idx = elements.findIndex((el) => el.id === selectedId);
    if (idx === -1 || idx === elements.length - 1) return;
    const next = [...elements];
    const [item] = next.splice(idx, 1);
    next.push(item);
    onChange(next);
  };

  const sendToBack = () => {
    if (!selectedId) return;
    const idx = elements.findIndex((el) => el.id === selectedId);
    if (idx <= 0) return;
    const next = [...elements];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    onChange(next);
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

        {/* Sticker Upload */}
        <button
          type="button"
          onClick={() => stickerInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 border border-purple-400/30 text-purple-300 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all disabled:opacity-40"
        >
          <span className="text-base leading-none">✦</span> {uploading ? 'Uploading…' : 'Sticker'}
        </button>
        <input
          ref={stickerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileChange(e, 'sticker')}
        />

        {/* Image Upload */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-40"
        >
          <span className="text-base leading-none">🖼</span> {uploading ? 'Uploading…' : 'Image'}
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onFileChange(e, 'image')}
        />

        {/* Layering controls (when element selected) */}
        {selectedId && (
          <div className="flex items-center gap-1.5 ml-1">
            <button
              type="button"
              onClick={bringToFront}
              title="Bring to Front"
              className="px-3 py-2.5 bg-white/5 border border-white/10 text-silk-white/60 rounded-lg text-xs hover:bg-white/10 hover:text-silk-white transition-all"
            >
              ⬆ Front
            </button>
            <button
              type="button"
              onClick={sendToBack}
              title="Send to Back"
              className="px-3 py-2.5 bg-white/5 border border-white/10 text-silk-white/60 rounded-lg text-xs hover:bg-white/10 hover:text-silk-white transition-all"
            >
              ⬇ Back
            </button>
          </div>
        )}

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

          {/* Render elements — array index determines z-order */}
          {elements.map((el, index) => {
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
                  zIndex: isSelected ? index + 100 : index + 1,
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

          {/* Floating toolbar — positioned inside the canvas to follow the element */}
          {selectedEl && (
            <FloatingElementToolbar
              el={selectedEl}
              renderedSize={renderedSize}
              scale={scale}
              onUpdate={updateElement}
            />
          )}

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
                Add text, stickers, or images to begin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      {toast && (
        <CanvasToast
          message={toast.message}
          isError={toast.isError}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
