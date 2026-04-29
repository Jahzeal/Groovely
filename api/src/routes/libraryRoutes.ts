import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {
  getLibrary,
  saveTrack,
  removeSavedTrack
} from '../controllers/libraryController';

const router = Router();

router.use(authMiddleware);

router.get('/', getLibrary);

router.post('/save/:id', saveTrack);
router.delete('/save/:id', removeSavedTrack);

export default router;