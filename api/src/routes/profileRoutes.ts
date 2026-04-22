import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import { requireCreator, requireFan } from '../middlewares/roleCheck';
import {
  createCreatorProfileController,
  getCreatorProfileController,
  updateCreatorProfileController,
  createFanProfileController,
  getFanProfileController,
  updateFanProfileController,
  getPublicProfileController
} from '../controllers/profileController';

const router = Router();

router.post('/creator/profile', authMiddleware, requireCreator, createCreatorProfileController);
router.get('/creator/profile', authMiddleware, requireCreator, getCreatorProfileController);
router.put('/creator/profile', authMiddleware, requireCreator, updateCreatorProfileController);

router.post('/fan/profile', authMiddleware, requireFan, createFanProfileController);
router.get('/fan/profile', authMiddleware, requireFan, getFanProfileController);
router.put('/fan/profile', authMiddleware, requireFan, updateFanProfileController);

router.get('/:username', getPublicProfileController);

export default router;