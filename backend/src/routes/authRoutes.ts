import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, logout, me } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
