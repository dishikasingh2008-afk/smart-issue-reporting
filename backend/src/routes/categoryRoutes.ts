import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';

const router = Router();

router.get('/', requireAuth, getCategories);
router.post('/', requireAuth, requireRole('ADMIN'), createCategory);
router.put('/:id', requireAuth, requireRole('ADMIN'), updateCategory);
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteCategory);

export default router;
