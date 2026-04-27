import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { recordStreamController } from '../controllers/streamController';

const router = Router();

// All stream routes require authentication
router.use(authMiddleware);

// Record a stream for a track
router.post('/tracks/:id/stream', recordStreamController);

export default router;