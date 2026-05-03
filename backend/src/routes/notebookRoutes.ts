import { Router } from 'express';
import { supabase } from '../config/supabase';
import { NotebookEntry } from '../types';

const router = Router();

// Constant for the system's "Recipient" (The Admin/Partner UID)
const RECIPIENT_UID = '4245ce5a-0f2a-4716-a2ff-d3993d5a5700';

/**
 * GET /api/notebook
 * Fetch entries where the user is sender or recipient
 */
router.get('/', async (req, res, next) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing user_id query parameter.'
      });
    }

    const { data, error } = await supabase
      .from('notebook')
      .select('*')
      .or(`sender_id.eq.${user_id},recipient_id.eq.${user_id}`)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/notebook
 * Create a new entry
 */
router.post('/', async (req, res, next) => {
  try {
    const { sender_id, content } = req.body;
    let { recipient_id } = req.body;

    if (!sender_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'Missing sender_id or content.'
      });
    }

    // Crucial: Logic for recipient defaulting
    if (sender_id !== RECIPIENT_UID) {
      recipient_id = RECIPIENT_UID;
    }

    const { data, error } = await supabase
      .from('notebook')
      .insert([
        {
          sender_id,
          recipient_id,
          content,
          kisses: 0
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/notebook/:id/kiss
 * Increment the kisses count
 */
router.patch('/:id/kiss', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Use RPC or a transaction-like update to increment reliably
    // Here we'll use a simple increment logic for now, or if RPC exists:
    // const { data, error } = await supabase.rpc('increment_kisses', { entry_id: id });
    
    // For now, let's fetch then update if no RPC is defined, 
    // or better, use Supabase's increment feature if available via postgrest
    
    const { data: current, error: fetchError } = await supabase
      .from('notebook')
      .select('kisses')
      .eq('id', id)
      .single();

    if (fetchError || !current) {
      return res.status(404).json({
        success: false,
        message: 'Notebook entry not found.'
      });
    }

    const { data, error } = await supabase
      .from('notebook')
      .update({ kisses: (current.kisses || 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: '💋 Sent a kiss!',
      data
    });
  } catch (err) {
    next(err);
  }
});

export default router;
