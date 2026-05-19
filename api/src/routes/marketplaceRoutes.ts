import { Router } from 'express';
import {
  getTrendingTracks,
  getForYouTracks,
  getTracksByCategory
} from '../controllers/marketplaceController';

const router = Router();

// Public
router.get('/trending', getTrendingTracks);
router.get('/for-you', getForYouTracks);
router.get('/category/:category', getTracksByCategory);

export default router;