import { Router } from 'express';
import letterRoutes from './letterRoutes';
import voucherRoutes from './voucherRoutes';

const router = Router();

router.use('/letters', letterRoutes);
router.use('/vouchers', voucherRoutes);

export default router;
