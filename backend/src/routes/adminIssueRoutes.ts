import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { updateStatus, updatePriority, assignIssue, addComment } from '../controllers/adminIssueController';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));
router.put('/:id/status', updateStatus);
router.put('/:id/priority', updatePriority);
router.put('/:id/assign', assignIssue);
router.post('/:id/comments', addComment);

export default router;
