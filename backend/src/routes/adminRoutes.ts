import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

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