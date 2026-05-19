import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireFan } from '../middlewares/roleCheck';
import {
  getTrendingTracks,
  getRecentTracks,
  getCreators,
  followCreator,
  unfollowCreator,
  getRecommendations
} from '../controllers/fanDashboardController';

const router = Router();

router.use(authMiddleware);
router.use(requireFan);

router.get('/trending', getTrendingTracks);
router.get('/recent', getRecentTracks);

router.get('/creators', getCreators);
router.post('/creators/:id/follow', followCreator);
router.delete('/creators/:id/follow', unfollowCreator);

// Recommendations
router.get('/recommendations', getRecommendations);

export default router;