import { Router } from 'express';
import { linkedinController } from '@controllers/linkedinController';
import { authenticate } from '@middleware/authenticate';

const router = Router();

router.use(authenticate);

// LinkedIn optimization routes
router.post('/optimize', linkedinController.optimizeProfile);

// User data routes (must come before parameterized routes)
router.get('/optimizations', linkedinController.getUserOptimizations);
router.get('/stats', linkedinController.getUserStats);
router.post('/compare', linkedinController.compareVersions);

// Parameterized routes
router.get('/:optimizationId', linkedinController.getOptimization);
router.patch('/:optimizationId/status', linkedinController.updateStatus);
router.delete('/:optimizationId', linkedinController.deleteOptimization);

export default router;
