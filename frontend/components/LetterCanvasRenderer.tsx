'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { CanvasElement } from '../types/canvas';

// ─── Canonical Canvas Size (must match LetterCanvas.tsx exactly) ───────────────
// All CanvasElement positions (x, y, width, height) are stored as percentages
// of this canonical size. The renderer places elements at these percentages of
// 390×844, then the ScaleContainer uses CSS `transform: scale()` to fit the
// entire canvas into whatever space is available — guaranteeing **zero alignment
// change** since no per-element coordinate recalculation happens.

const CANVAS_W = 390;
const CANVAS_H = 844;

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
 *   1. A wrapper div measures its available width via ResizeObserver.
 *   2. We compute the uniform scale factor: availW / 390.
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
      setScaleFactor(width / CANVAS_W);
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
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ─── Bloom Animation Variants ─────────────────────────────────────────────────

const bloomContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.3,
    },
  },
};

const bloomElement = {
  hidden: {
    opacity: 0,
    scale: 0.6,
    filter: 'blur(8px)',
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    y: 0,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 120,
      duration: 0.7,
    },
  },
};

// ─── Element Renderer ─────────────────────────────────────────────────────────

interface RenderElementProps {
  el: CanvasElement;
  index: number;
  animated: boolean;
}

function RenderElement({ el, index, animated }: RenderElementProps) {
  const left = (el.x / 100) * CANVAS_W;
  const top = (el.y / 100) * CANVAS_H;
  const width = (el.width / 100) * CANVAS_W;
  const height = (el.height / 100) * CANVAS_H;

  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    left,
    top,
    width,
    height,
    zIndex: index + 1,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  };

  // Wrapper: motion.div handles the bloom animation + rotation
  // Inner: the actual content (text div or img)
  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? { variants: bloomElement, style: { ...positionStyle, transform: `rotate(${el.rotation}deg)` } }
    : { style: { ...positionStyle, transform: `rotate(${el.rotation}deg)` } };

  if (el.type === 'text') {
    // Detect if content contains HTML tags (legacy Quill content)
    const isHtml = /<[a-z][\s\S]*>/i.test(el.content);

    const textStyle: React.CSSProperties = {
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
      padding: 16,
      fontSize: `${el.style.fontSize ?? 16}px`,
      color: el.style.color ?? '#1a1a1a',
      fontFamily: el.style.fontFamily ?? 'Georgia, serif',
      fontWeight: el.style.fontWeight ?? '400',
      textAlign: (el.style.textAlign as React.CSSProperties['textAlign']) ?? 'left',
      opacity: el.style.opacity ?? 1,
      overflow: 'hidden',
      overflowWrap: 'anywhere',
      whiteSpace: 'pre-wrap',
      wordBreak: 'normal',
      userSelect: 'text',
      lineHeight: 1.6,
      display: 'block',
    };

    return (
      // @ts-expect-error -- motion.div and div have compatible props here
      <Wrapper {...wrapperProps}>
        {isHtml ? (
          <div
            style={textStyle}
            dangerouslySetInnerHTML={{ __html: el.content }}
            className="canvas-legacy-html"
          />
        ) : (
          <div style={textStyle}>
            {el.content}
          </div>
        )}
      </Wrapper>
    );
  }

  if (el.type === 'image' || el.type === 'sticker') {
    return (
      // @ts-expect-error -- motion.div and div have compatible props here
      <Wrapper {...wrapperProps}>
        <img
          src={el.content}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            opacity: el.style.opacity ?? 1,
            userSelect: 'none',
          }}
        />
      </Wrapper>
    );
  }

  return null;
}

// ─── Main Renderer ────────────────────────────────────────────────────────────

interface LetterCanvasRendererProps {
  elements: CanvasElement[];
  /** When true, elements bloom/fade-in with staggered animation. */
  animated?: boolean;
}

/**
 * Read-only canvas renderer with optional reveal animation.
 *
 * Renders `CanvasElement[]` at the fixed 390×844 canonical size, wrapped
 * in a `ScaleContainer` that uses CSS `transform: scale()` to fit any
 * parent. Zero alignment change guaranteed.
 *
 * When `animated` is true, elements enter with a staggered "bloom"
 * effect — scaling up from 0.6, blurring in, and sliding upward.
 */
export default function LetterCanvasRenderer({ elements, animated = false }: LetterCanvasRendererProps) {
  const ContainerEl = animated ? motion.div : 'div';
  const containerProps = animated
    ? { variants: bloomContainer, initial: 'hidden', animate: 'visible' }
    : {};

  return (
    <ScaleContainer>
      <ContainerEl
        {...containerProps}
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
          <RenderElement key={el.id} el={el} index={index} animated={animated} />
        ))}
      </ContainerEl>
    </ScaleContainer>
  );
}
