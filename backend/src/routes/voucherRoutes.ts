import { Router } from 'express';

const router = Router();

// Placeholder for getting all vouchers
router.get('/', (req, res) => {
  res.json({ message: 'GET /api/vouchers' });
});

// Placeholder for redeeming a voucher
router.post('/:id/redeem', (req, res) => {
  res.json({ message: `POST /api/vouchers/${req.params.id}/redeem` });
});

export default router;
