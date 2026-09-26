import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getLeaderboard } from '../controllers/leaderboardController';

const router = Router();

router.get('/', requireAuth, getLeaderboard);

export default router;
