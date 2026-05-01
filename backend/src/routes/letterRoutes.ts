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

// Get saved letters (history)
router.get('/history', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('letters')
      .select('*')
      .eq('is_saved', true)
      .order('saved_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch letter history.',
        error: error.message,
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

// Save a letter to history
router.patch('/:id/save', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('letters')
      .update({
        is_saved: true,
        saved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to save letter to history.',
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Memory saved forever! ❤',
      data,
    });
  } catch (err) {
    next(err);
  }
});

// Unsave a letter from history
router.patch('/:id/unsave', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('letters')
      .update({
        is_saved: false,
        saved_at: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Failed to remove letter from history.',
        error: error.message,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Memory removed from history.',
      data,
    });
  } catch (err) {
    next(err);
  }
});


export default router;
