import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireCreator } from '../middlewares/roleCheck';
import {
  uploadTrack,
  getMyTracks,
  getTrack,
  updateTrackController,
  deleteTrackController
} from '../controllers/trackController';

const router = Router();

router.use(authMiddleware);
router.use(requireCreator);

router.post('/tracks', uploadTrack);

router.get('/tracks', getMyTracks);

router.get('/tracks/:id', getTrack);
router.patch('/tracks/:id', updateTrackController);
router.delete('/tracks/:id', deleteTrackController);

export default router;