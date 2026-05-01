import { Router } from 'express';
import {
  getTrendingTracks,
  getForYouTracks,
  getTracksByCategory,
  getTrackDetails
} from '../controllers/marketplaceController';

const router = Router();

// Public
router.get('/trending', getTrendingTracks);
router.get('/for-you', getForYouTracks);
router.get('/category/:category', getTracksByCategory);
router.get('/tracks/:id', getTrackDetails);

export default router;