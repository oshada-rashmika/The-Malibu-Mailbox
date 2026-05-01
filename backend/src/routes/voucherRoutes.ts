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

// Redeem a voucher
router.patch('/:id/redeem', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('vouchers')
      .update({
        is_redeemed: true,
        redeemed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Voucher redeemed successfully! 🎉',
      data: data as Voucher,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
