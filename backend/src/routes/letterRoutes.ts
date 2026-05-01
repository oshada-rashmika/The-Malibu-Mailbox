import { Router } from 'express';

const router = Router();

// Placeholder for getting all letters (archived/available)
router.get('/', (req, res) => {
  res.json({ message: 'GET /api/letters' });
});

// Placeholder for getting today's letter
router.get('/today', (req, res) => {
  res.json({ message: 'GET /api/letters/today' });
});

export default router;
