import { Router } from 'express';
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

const buildBouquetFlowers = (bouquetId: string, flowers: string[]) => {
  const layout = buildBouquetLayout(flowers.length);
  const arranged = flowers.map((flower, index) => ({
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
router.post('/letters', async (req, res, next) => {
  try {
    const { title, content, date, user_id } = req.body;

    if (!content || !date) {
      return res.status(400).json({
        success: false,
        message: 'Letter content and a specific date are required.',
      });
    }

    // Validate that the date is in the future
    const scheduledDate = new Date(date);
    const today = new Date();
    // Normalize today to start of day for accurate future comparison
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
        message: 'The specific date must be in the future.',
      });
    }

    // Perform database insertion
    const { data, error } = await supabase
      .from('letters')
      .insert([{
        title: title || 'A Secret Letter',
        content,
        scheduled_for: date, // Format YYYY-MM-DD expected
        user_id: user_id || null, // Important if your database schema secures rows by RLS
      }])


      .select()
      .single();

    if (error) {
      console.error('[Admin] Error saving letter:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save the letter.',
        error: error.message,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Letter successfully scheduled! 🕊️',
      data,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/vouchers
router.post('/vouchers', async (req, res, next) => {
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
router.post('/bouquets', async (req, res, next) => {
  try {
    const noteTo = typeof req.body.note_to === 'string' ? req.body.note_to.trim() : '';
    const noteFrom = typeof req.body.note_from === 'string' ? req.body.note_from.trim() : '';
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    const recipientId = typeof req.body.recipient_id === 'string' ? req.body.recipient_id.trim() : '';
    const rawFlowers = Array.isArray(req.body.flowers) ? req.body.flowers : [];
    const flowers = rawFlowers
      .map((flower) => (typeof flower === 'string' ? flower.trim() : ''))
      .filter(Boolean);

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

    if (flowers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one flower type is required.'
      });
    }

    const invalidFlower = flowers.find((flower) => !ALLOWED_FLOWER_TYPES.has(flower));
    if (invalidFlower) {
      return res.status(400).json({
        success: false,
        message: `Invalid flower type: ${invalidFlower}.`
      });
    }

    const chunks: string[][] = [];
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
router.post('/flowers', async (req, res, next) => {
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