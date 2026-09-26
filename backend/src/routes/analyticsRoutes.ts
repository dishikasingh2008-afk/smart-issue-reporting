import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { getDashboardAnalytics } from '../controllers/analyticsController';

const router = Router();

router.get('/dashboard', requireAuth, requireRole('ADMIN'), getDashboardAnalytics);

export default router;
