import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { getUsers, getUserById } from '../controllers/userController';

const router = Router();

router.use(requireAuth, requireRole('ADMIN'));
router.get('/', getUsers);
router.get('/:id', getUserById);

export default router;
