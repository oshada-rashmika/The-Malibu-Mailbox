import { Router } from 'express';
import letterRoutes from './letterRoutes';
import voucherRoutes from './voucherRoutes';
import adminRoutes from './adminRoutes';
import flowerRoutes from './flowerRoutes';
import notebookRoutes from './notebookRoutes';

const router = Router();

router.use('/letters', letterRoutes);
router.use('/vouchers', voucherRoutes);
router.use('/flowers', flowerRoutes);
router.use('/notebook', notebookRoutes);
router.use('/admin', adminRoutes);

export default router;
