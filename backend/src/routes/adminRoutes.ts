import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import type { BouquetFlower, FlowerType } from '../types';
import { supabase } from '../config/supabase';

const router = Router();

const FLOWER_CHUNK_SIZE = 10;
const LEAF_TYPE = 'leaf';
const ALLOWED_FLOWER_TYPES = new Set([
  'blue',
  'cornflower',
  'flower',
  'Hibiscus',
  'lily',
  'poppy',
  'purple',
  'rose',
  'sunflower',
  'tulip'
]);

type RawFlower = string | { flower_type?: string };
type BouquetFlowerInsert = Omit<BouquetFlower, 'id'>;

const isFlowerType = (flower: string): flower is FlowerType => ALLOWED_FLOWER_TYPES.has(flower);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// Fan layout for bouquet flowers so the front end can render consistent placements.
const buildBouquetLayout = (count: number) => {
  if (count <= 0) return [];

  if (count === 1) {
    return [
      {
        x_pos: 50,
        y_pos: 40,
        rotation: 0,
        scale: 1,
        z_index: 3
      }
    ];
  }

  const centerX = 50;
  const centerY = 42;
  const spread = Math.min(44, 8 * count);
  const startX = centerX - spread / 2;
  const step = count > 1 ? spread / (count - 1) : 0;

  return Array.from({ length: count }, (_, index) => {
    const offset = index - (count - 1) / 2;
    const xPos = clamp(startX + index * step, 8, 92);
    const yPos = clamp(centerY + Math.abs(offset) * 2.8, 20, 80);
    const rotation = Math.round(offset * 8);
    const scale = Number((1 - Math.min(Math.abs(offset) * 0.05, 0.2)).toFixed(2));
    const zIndex = 2 + Math.round(count - Math.abs(offset));

    return {
      x_pos: xPos,
      y_pos: yPos,
      rotation,
      scale,
      z_index: zIndex
    };
  });
};

const buildBouquetFlowers = (bouquetId: string, flowers: FlowerType[]): BouquetFlowerInsert[] => {
  const layout = buildBouquetLayout(flowers.length);
  const arranged = flowers.map((flower: FlowerType, index) => ({
    bouquet_id: bouquetId,
    flower_type: flower,
    ...layout[index]
  }));

  return [
    {
      bouquet_id: bouquetId,
      flower_type: LEAF_TYPE,
      x_pos: 50,
      y_pos: 72,
      rotation: 0,
      scale: 1.15,
      z_index: 1
    },
    ...arranged
  ];
};

// POST /api/admin/letters
router.post('/letters', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, date, user_id } = req.body;

    // ── Validate content is a non-empty CanvasElement[] array ──
    if (!Array.isArray(content)) {
      console.error('[Admin] Letters: content is not an array.', { contentType: typeof content });
      return res.status(400).json({
        success: false,
        message: 'Letter content must be a JSON array of canvas elements (CanvasElement[]).',
      });
    }

    if (content.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Letter content must contain at least one canvas element.',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'A delivery date is required.',
      });
    }

    // ── Validate date ──
    const scheduledDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format.',
      });
    }

    if (scheduledDate <= today) {
      return res.status(400).json({
        success: false,
        message: 'The delivery date must be in the future.',
      });
    }

    // ── Insert into Supabase ──
    // IMPORTANT: Do NOT JSON.stringify(content). The Supabase JS client
    // handles JSONB columns natively — pass the array directly.
    const insertPayload = {
      title: title || 'A Secret Letter',
      content,                          // CanvasElement[] → JSONB natively
      scheduled_for: date,              // YYYY-MM-DD
      user_id: user_id || null,
    };

    console.log('[Admin] Inserting letter:', {
      title: insertPayload.title,
      elementCount: content.length,
      scheduledFor: date,
      userId: user_id || '(none)',
    });

    const { data, error } = await supabase
      .from('letters')
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      // Log the full Supabase error for debugging
      console.error('[Admin] Supabase error saving letter:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return res.status(500).json({
        success: false,
        message: `Failed to save the letter: ${error.message}`,
        error: error.message,
        hint: error.hint || null,
        code: error.code || null,
      });
    }

    console.log('[Admin] Letter saved successfully:', data.id);

    res.status(201).json({
      success: true,
      message: 'Letter successfully scheduled! 🕊️',
      data,
    });
  } catch (err: any) {
    console.error('[Admin] Unexpected error in POST /letters:', err?.message || err);
    next(err);
  }
});

// POST /api/admin/vouchers
router.post('/vouchers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, code, user_id } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Voucher title and description are required.',
      });
    }

    const { data, error } = await supabase
      .from('vouchers')
      .insert([{
        title,
        description,
        code: code || null,
        user_id: user_id, // include user_id if managing specifically per user
        is_redeemed: false,
      }])
      .select()
      .single();

    if (error) {
      console.error('[Admin] Error creating voucher:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create the voucher.',
        error: error.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Voucher successfully minted! 🎁',
      data,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/bouquets
router.post('/bouquets', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const noteTo = typeof req.body.note_to === 'string' ? req.body.note_to.trim() : '';
    const noteFrom = typeof req.body.note_from === 'string' ? req.body.note_from.trim() : '';
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    const recipientId = typeof req.body.recipient_id === 'string' ? req.body.recipient_id.trim() : '';
    const rawFlowers = Array.isArray(req.body.flowers) ? (req.body.flowers as RawFlower[]) : [];
    const normalizedFlowers = rawFlowers
      .map((flower: RawFlower) => {
        if (typeof flower === 'string') return flower.trim();
        if (flower && typeof flower.flower_type === 'string') return flower.flower_type.trim();
        return '';
      })
      .filter((flower): flower is string => flower.length > 0);

    if (!noteTo || !noteFrom || !message) {
      return res.status(400).json({
        success: false,
        message: 'note_to, note_from, and message are required.'
      });
    }

    if (!recipientId) {
      return res.status(400).json({
        success: false,
        message: 'recipient_id is required.'
      });
    }

    if (normalizedFlowers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one flower type is required.'
      });
    }

    const invalidFlower = normalizedFlowers.find((flower: string) => !isFlowerType(flower));
    if (invalidFlower) {
      return res.status(400).json({
        success: false,
        message: `Invalid flower type: ${invalidFlower}.`
      });
    }

    const flowers = normalizedFlowers.filter(isFlowerType);

    const chunks: FlowerType[][] = [];
    for (let i = 0; i < flowers.length; i += FLOWER_CHUNK_SIZE) {
      chunks.push(flowers.slice(i, i + FLOWER_CHUNK_SIZE));
    }

    const createdBouquets: Array<{ bouquet_id: string; flower_count: number }> = [];

    for (const chunk of chunks) {
      const { data: bouquet, error: bouquetError } = await supabase
        .from('bouquets')
        .insert([
          {
            user_id: recipientId,
            note_to: noteTo,
            note_from: noteFrom,
            message
          }
        ])
        .select()
        .single();

      if (bouquetError || !bouquet) {
        console.error('[Admin] Error creating bouquet:', bouquetError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create the bouquet.',
          error: bouquetError?.message
        });
      }

      const bouquetFlowers = buildBouquetFlowers(bouquet.id, chunk);
      const { error: bouquetFlowerError } = await supabase
        .from('bouquet_flowers')
        .insert(bouquetFlowers);

      if (bouquetFlowerError) {
        console.error('[Admin] Error creating bouquet flowers:', bouquetFlowerError);
        return res.status(500).json({
          success: false,
          message: 'Failed to add bouquet flowers.',
          error: bouquetFlowerError.message
        });
      }

      createdBouquets.push({
        bouquet_id: bouquet.id,
        flower_count: chunk.length
      });
    }

    const suffix = createdBouquets.length === 1 ? '' : 's';
    res.status(201).json({
      success: true,
      message: `Bouquet${suffix} created successfully.`,
      data: createdBouquets
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/flowers
router.post('/flowers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flower_type, meaning, color_hex, recipient_id } = req.body;
    const cleanRecipientId = recipient_id?.trim();

    if (!flower_type || !meaning || !color_hex || !cleanRecipientId) {
      return res.status(400).json({
        success: false,
        message: 'flower_type, meaning, color_hex, and recipient_id are required.',
      });
    }

    const { data, error } = await supabase
      .from('flowers')
      .insert([{
        flower_type,
        meaning,
        color_hex,
        user_id: cleanRecipientId, // Map frontend's recipient_id to DB's user_id
      }])
      .select()
      .single();

    if (error) {
      console.error('[Admin] Error minting flower:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to mint the flower.',
        error: error.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Flower successfully minted! 🌸',
      data,
    });
  } catch (err) {
    next(err);
  }
});

export default router;