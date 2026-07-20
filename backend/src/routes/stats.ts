import { Router } from 'express';
import { getDashboardStats, getAnalytics, getLeaderboard } from '../controllers/stats';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateJWT as any, getDashboardStats as any);
router.get('/analytics', authenticateJWT as any, getAnalytics as any);
router.get('/leaderboard', authenticateJWT as any, getLeaderboard as any);

export default router;
