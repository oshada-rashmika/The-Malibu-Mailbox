// ─── Canvas Element Types ─────────────────────────────────────────────────────

/** Visual style properties for a canvas text element. */
export interface CanvasElementStyle {
  /** Font size in pixels. */
  fontSize?: number;
  /** CSS color string, e.g. "#3f2d25" or "rgba(0,0,0,0.8)". */
  color?: string;
  /** Full CSS font-family string, e.g. "Playfair Display, serif". */
  fontFamily?: string;
  /** Font weight, e.g. "400", "700", "bold". */
  fontWeight?: string;
  /** Text alignment — only meaningful for type "text". */
  textAlign?: 'left' | 'center' | 'right';
  /** CSS opacity 0–1. */
  opacity?: number;
}

/** Discriminated union of element types supported by the canvas editor. */
export type CanvasElementType = 'text' | 'image' | 'sticker';

/**
 * A single element placed on the canvas letter editor.
 *
 * All positional values (x, y, width, height) are stored in pixels relative
 * to the canvas origin (top-left = 0,0) at the canonical canvas size used
 * during authoring. Consumers must scale them to the current viewport.
 */
export interface CanvasElement {
  /** UUID — unique within the letter's element array. */
  id: string;

  /** Discriminator for rendering and editing behaviour. */
  type: CanvasElementType;

  // ── Position & size (px at authoring resolution) ─────────────────────────
  x: number;
  y: number;
  width: number;
  height: number;

  /** Rotation in degrees (clockwise). 0 = no rotation. */
  rotation: number;

  /**
   * For type "text": the raw text string.
   * For type "image" | "sticker": an absolute URL or a storage path.
   */
  content: string;

  /** Visual style — only applicable fields are required per type. */
  style: CanvasElementStyle;

  /**
   * Optional explicit z-index hint.
   * In practice, render order is determined by array position (later = on top).
   * This field exists for serialization clarity.
   */
  zIndex?: number;
}

// ─── Letter (Canvas-based) ────────────────────────────────────────────────────

/**
 * A letter stored in the `letters` table.
 *
 * The `content` column is `JSONB` in Supabase (see migration below).
 * It stores a serialized `CanvasElement[]` representing the full canvas state.
 *
 * @example
 * const elements: CanvasElement[] = JSON.parse(letter.content);
 *
 * With JSONB the backend can also query directly:
 * .select('*').filter('content->0->>type', 'eq', 'text')
 */
export interface Letter {
  id: string;
  created_at: string;
  /** ISO Date string (YYYY-MM-DD) — the day this letter becomes visible. */
  scheduled_for: string;
  title: string;
  /**
   * Canvas element array.
   *
   * Supabase returns JSONB columns as already-parsed JavaScript values, so
   * `content` will be a `CanvasElement[]` directly (not a JSON string) when
   * queried via the JS client.
   */
  content: CanvasElement[];
  /** Optional fields present after the letter is saved to history. */
  is_saved?: boolean;
  saved_at?: string;
}
