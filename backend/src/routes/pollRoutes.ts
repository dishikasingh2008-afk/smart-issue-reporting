import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { getPolls, createPoll, votePoll, togglePoll, deletePoll } from '../controllers/pollController';

const router = Router();

router.use(requireAuth);
router.get('/', getPolls);
router.post('/', requireRole('ADMIN'), createPoll);
router.post('/:id/vote', votePoll);
router.put('/:id/toggle', requireRole('ADMIN'), togglePoll);
router.delete('/:id', requireRole('ADMIN'), deletePoll);

export default router;
