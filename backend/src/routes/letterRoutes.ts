import { Router } from 'express';
import { supabase } from '../config/supabase';
import { Letter } from '../types';

const router = Router();

// Placeholder for getting all letters (archived/available)
router.get('/', (req, res) => {
  res.json({ message: 'GET /api/letters' });
});

// Get today's letter
router.get('/today', async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('scheduled_for', today)
      .returns<Letter>()
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: 'No letter found for today. Check back tomorrow! 🌸',
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
