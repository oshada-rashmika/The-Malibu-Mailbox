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
  const innerRef = useRef<HTMLDivElement>(null);
  const [scaleFactor, setScaleFactor] = useState(1);
  const [contentHeight, setContentHeight] = useState(CANVAS_H);

  useEffect(() => {
    const measure = () => {
      if (!wrapperRef.current) return;
      const { width } = wrapperRef.current.getBoundingClientRect();
      const currentScale = width / CANVAS_W;
      setScaleFactor(currentScale);

      // Measure inner content height in case legacy letters expand it
      if (innerRef.current) {
        // We use scrollHeight to capture fully expanded relative content
        setContentHeight(Math.max(CANVAS_H, innerRef.current.scrollHeight));
      }
    };

    measure();
    
    // We observe both the wrapper (for width changes) and the inner content (for height expansion)
    const ro = new ResizeObserver(measure);
    if (wrapperRef.current) ro.observe(wrapperRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    
    // Also re-measure after a slight delay to ensure fonts/images are loaded
    const timeoutId = setTimeout(measure, 100);

    return () => {
      ro.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      style={{
        width: '100%',
        // Apply exactly the scaled height of the content
        height: contentHeight * scaleFactor,
        position: 'relative',
        // The modal handles overall overflow, but we keep this clean
        overflow: 'hidden',
        transition: 'height 0.2s ease-out',
      }}
    >
      <div
        ref={innerRef}
        style={{
          width: CANVAS_W,
          minHeight: CANVAS_H,
          height: 'max-content',
          transform: `scale(${scaleFactor})`,
          transformOrigin: 'top left',
          position: 'absolute',
          left: 0,
          top: 0,
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

  // For images/stickers, use exact stored coordinates
  const positionStyle: React.CSSProperties = {
    position: 'absolute',
    left,
    top,
    width,
    height,
    maxWidth: CANVAS_W,
    zIndex: index + 1,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  };

  const Wrapper = animated ? motion.div : 'div';

  if (el.type === 'text') {
    // Detect if content contains HTML tags (legacy Quill content)
    const isHtml = /<[a-z][\s\S]*>/i.test(el.content);

    // For text elements: use full canvas width and let height auto-expand.
    // Legacy HTML letters are set to relative positioning so they stretch the paper
    // height automatically instead of overflowing out of the bottom.
    const textPositionStyle: React.CSSProperties = {
      position: isHtml ? 'relative' : 'absolute',
      left: isHtml ? 0 : left,
      top: isHtml ? 0 : top,
      marginTop: isHtml ? top : 0,
      width: isHtml ? CANVAS_W : width,
      height: isHtml ? 'auto' : height,
      minHeight: isHtml ? height : undefined,
      zIndex: index + 1,
      pointerEvents: 'none',
      boxSizing: 'border-box',
      transform: `rotate(${el.rotation}deg)`,
    };

    const textWrapperProps = animated
      ? { variants: bloomElement, style: textPositionStyle }
      : { style: textPositionStyle };

    const textStyle: React.CSSProperties = {
      display: 'block',
      width: '100%',
      height: isHtml ? 'auto' : '100%',
      boxSizing: 'border-box',
      padding: isHtml ? '16px 24px' : 0,
      fontSize: `${el.style.fontSize ?? 16}px`,
      color: el.style.color ?? '#1a1a1a',
      fontFamily: el.style.fontFamily ?? 'Georgia, serif',
      fontWeight: el.style.fontWeight ?? '400',
      textAlign: (el.style.textAlign as React.CSSProperties['textAlign']) ?? 'left',
      opacity: el.style.opacity ?? 1,
      overflow: isHtml ? 'visible' : 'hidden',
      overflowWrap: isHtml ? 'anywhere' : 'break-word',
      wordBreak: isHtml ? 'normal' : 'break-word',
      whiteSpace: isHtml ? 'normal' : 'pre-wrap',
      userSelect: 'text',
      lineHeight: isHtml ? 1.6 : 1.4,
    };

    return (
      // @ts-expect-error -- motion.div and div have compatible props here
      <Wrapper {...textWrapperProps}>
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
    const imgWrapperProps = animated
      ? { variants: bloomElement, style: { ...positionStyle, transform: `rotate(${el.rotation}deg)` } }
      : { style: { ...positionStyle, transform: `rotate(${el.rotation}deg)` } };

    return (
      // @ts-expect-error -- motion.div and div have compatible props here
      <Wrapper {...imgWrapperProps}>
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
          minHeight: CANVAS_H,
          height: 'max-content',
          paddingBottom: 40, // Ensure long text doesn't hit the very bottom edge
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
