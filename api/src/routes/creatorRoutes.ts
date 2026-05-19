import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireCreator } from '../middlewares/roleCheck';
import { getCreatorData } from '../controllers/creatorController';
import { getDashboardStatsController, getDashboardTracksController } from '../controllers/dashboardController';

const router = Router();

// All creator routes require authentication and creator role
router.use(authMiddleware);
router.use(requireCreator);

// Creator dashboard (placeholder)
router.get('/', getCreatorData);

// Dashboard stats and tracks
router.get('/dashboard/stats', getDashboardStatsController);
router.get('/dashboard/tracks', getDashboardTracksController);

export default router;