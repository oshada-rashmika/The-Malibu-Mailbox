'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { CanvasElement } from '../types/canvas';

// ─── Canonical Canvas Size (must match LetterCanvas.tsx exactly) ───────────────

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
 * The transform-origin is top-center and the inner box is centered via
 * margin: 0 auto so there is never a grey gap on either side.
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
      style={{
        width: '100%',
        // Reserve exact scaled height (CSS transforms don't affect layout flow)
        height: CANVAS_H * scaleFactor,
        overflow: 'hidden',
        margin: '0 auto',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'top center',
          // Center the 390px box inside the wrapper before scaling
          margin: '0 auto',
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
    maxWidth: CANVAS_W,          // never exceed canvas edge
    zIndex: index + 1,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  };

  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? { variants: bloomElement, style: { ...positionStyle, transform: `rotate(${el.rotation}deg)` } }
    : { style: { ...positionStyle, transform: `rotate(${el.rotation}deg)` } };

  if (el.type === 'text') {
    // Detect if content contains HTML tags (legacy Quill content)
    const isHtml = /<[a-z][\s\S]*>/i.test(el.content);

    const textStyle: React.CSSProperties = {
      display: 'block',
      width: '100%',
      maxWidth: '100%',
      height: '100%',
      boxSizing: 'border-box',
      padding: 16,
      fontSize: `${el.style.fontSize ?? 16}px`,
      color: el.style.color ?? '#1a1a1a',
      fontFamily: el.style.fontFamily ?? 'Georgia, serif',
      fontWeight: el.style.fontWeight ?? '400',
      textAlign: (el.style.textAlign as React.CSSProperties['textAlign']) ?? 'left',
      opacity: el.style.opacity ?? 1,
      overflow: 'hidden',
      // Key wrapping rules — 'anywhere' is stronger than 'break-word'
      overflowWrap: 'anywhere',
      wordBreak: 'normal',
      // For plain text, preserve line breaks. For HTML, let <p> tags handle spacing.
      whiteSpace: isHtml ? 'normal' : 'pre-wrap',
      userSelect: 'text',
      lineHeight: 1.6,
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
          // Ensure the paper fills exactly — no gap
          margin: 0,
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
