import { Router } from 'express';
import { supabase } from '../config/supabase';
import { Voucher } from '../types';

const router = Router();

// Get all unredeemed vouchers
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .eq('is_redeemed', false)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(200).json({
      success: true,
      data: data as Voucher[],
    });
  } catch (err) {
    next(err);
  }
});

// Placeholder for redeeming a voucher
router.post('/:id/redeem', (req, res) => {
  res.json({ message: `POST /api/vouchers/${req.params.id}/redeem` });
});

export default router;
