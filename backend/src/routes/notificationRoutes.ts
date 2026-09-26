import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getNotifications, markAsRead } from '../controllers/notificationController';

const router = Router();

router.use(requireAuth);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

export default router;
