import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireCreator } from '../middlewares/roleCheck';
import { getCreatorData } from '../controllers/creatorController';

const router = Router();

router.use(authMiddleware);
router.use(requireCreator);

router.get('/', getCreatorData);

export default router;