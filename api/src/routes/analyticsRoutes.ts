import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireCreator } from '../middlewares/roleCheck';
import {
  getPlaysAnalytics,
  getEarningsAnalytics,
  getListenersAnalytics,
  getTopTracks
} from '../controllers/analyticsController';

const router = Router();

router.use(authMiddleware);
router.use(requireCreator);

router.get('/plays', getPlaysAnalytics);
router.get('/earnings', getEarningsAnalytics);
router.get('/listeners', getListenersAnalytics);

router.get('/top-tracks', getTopTracks);

export default router;