import { Router } from 'express';
import { supabase } from '../config/supabase';

const router = Router();

// GET /api/flowers
router.get('/', async (req, res, next) => {
  try {
    // Attempt to extract user_id from query or authorization header
    let userId = req.query.user_id as string | undefined;

    if (req.headers.authorization) {
      const token = req.headers.authorization.replace('Bearer ', '');
      const { data: authData } = await supabase.auth.getUser(token);
      if (authData?.user?.id) {
        userId = authData.user.id;
      }
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User ID or Authorization header is required.',
      });
    }

    const { data, error } = await supabase
      .from('flowers')
      .select('*')
      .eq('recipient_id', userId)
      .order('sent_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
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