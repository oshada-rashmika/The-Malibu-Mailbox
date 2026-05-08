export type FlowerType =
  | 'blue'
  | 'cornflower'
  | 'flower'
  | 'Hibiscus'
  | 'leaf'
  | 'lily'
  | 'poppy'
  | 'purple'
  | 'rose'
  | 'sunflower'
  | 'tulip';

// ─── Canvas Types ─────────────────────────────────────────────────────────────

export interface CanvasElementStyle {
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
}

export type CanvasElementType = 'text' | 'image' | 'sticker';

/**
 * A single element on the canvas letter editor.
 * Stored as part of the JSONB `content` array in the `letters` table.
 */
export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string;
  style: CanvasElementStyle;
}

// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface Letter {
  id: string;
  created_at: string;
  scheduled_for: string; // ISO Date string (YYYY-MM-DD)
  title: string;
  /**
   * Parsed JSONB array of canvas elements.
   * Supabase JS client returns JSONB columns as native JS values — no
   * JSON.parse() needed on the backend when using the typed client.
   */
  content: CanvasElement[];
  is_saved?: boolean;
  saved_at?: string;
}

export interface Voucher {
  id: string;
  created_at: string;
  title: string;
  description: string;
  is_redeemed: boolean;
  redeemed_at?: string;
}

export interface Flower {
  id: string;
  sent_at: string;
  flower_type: FlowerType;
  meaning: string;
  color_hex: string;
  user_id: string; // Refers to the auth.users(id) in the DB
}

export interface Bouquet {
  id: string;
  user_id?: string;
  note_to: string;
  note_from: string;
  message: string;
  created_at: string;
}

export interface BouquetFlower {
  id: string;
  bouquet_id: string;
  flower_type: FlowerType;
  x_pos: number;
  y_pos: number;
  rotation: number;
  scale: number;
  z_index: number;
}

export interface NotebookEntry {
  id: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  kisses: number;
}

