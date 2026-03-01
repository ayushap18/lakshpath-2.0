import { Router } from 'express';

import { adminController } from '@controllers/adminController';
import { authenticate } from '@middleware/authenticate';
import { requireAdmin } from '@middleware/requireAdmin';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetail);
router.patch('/users/:id', adminController.updateUser);
router.get('/revenue', adminController.getRevenue);
router.get('/usage', adminController.getUsageStats);

export default router;
