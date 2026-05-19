import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireFan } from '../middlewares/roleCheck';
import { getFanData } from '../controllers/fanController';

const router = Router();

router.use(authMiddleware);
router.use(requireFan);

router.get('/', getFanData);

export default router;