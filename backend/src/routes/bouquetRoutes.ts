import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET /api/bouquets
router.get('/', async (req, res, next) => {
  try {
    const userId = typeof req.query.user_id === 'string' ? req.query.user_id : undefined;
    const noteTo = typeof req.query.note_to === 'string' ? req.query.note_to : undefined;
    const noteFrom = typeof req.query.note_from === 'string' ? req.query.note_from : undefined;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required.'
      });
    }

    let query = supabase
      .from('bouquets')
      .select('*, bouquet_flowers(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .order('z_index', { ascending: true, foreignTable: 'bouquet_flowers' });

    if (noteTo) {
      query = query.eq('note_to', noteTo);
    }

    if (noteFrom) {
      query = query.eq('note_from', noteFrom);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
});

export default router;
