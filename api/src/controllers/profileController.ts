import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { query } from '../config/database';
import cloudinary from '../config/cloudinary';
import {
  createCreatorProfile as createCreatorProfileService,
  updateCreatorProfile as updateCreatorProfileService,
  getCreatorProfileById,
  createFanProfile as createFanProfileService,
  updateFanProfile as updateFanProfileService,
  getFanProfileById,
  getPublicProfile as getPublicProfileService
} from '../services/profileService';
import {
  sendSuccess,
  sendBadRequest,
  sendNotFound,
  sendInternalError
} from '../helpers/response';
import { ErrorMessages, SuccessMessages } from '../constants';

// Helper to get stats for a creator
const getCreatorStats = async (creatorId: number) => {
  const allTimeResult = await query(
    `SELECT COUNT(ts.id) as total
     FROM track_streams ts
     JOIN tracks t ON ts.track_id = t.id
     WHERE t.user_id = $1`,
    [creatorId]
  );
  const allTimePlays = parseInt(allTimeResult.rows[0]?.total || 0);

  const followersResult = await query(
    'SELECT COUNT(id) as total FROM follows WHERE following_id = $1',
    [creatorId]
  );
  const followers = parseInt(followersResult.rows[0]?.total || 0);

  const monthlyResult = await query(
    `SELECT COUNT(DISTINCT ts.user_id) as total
     FROM track_streams ts
     JOIN tracks t ON ts.track_id = t.id
     WHERE t.user_id = $1 AND ts.played_at >= NOW() - INTERVAL '30 days'`,
    [creatorId]
  );
  const monthlyListeners = parseInt(monthlyResult.rows[0]?.total || 0);

  return {
    all_time_plays: allTimePlays,
    followers: followers,
    monthly_listeners: monthlyListeners
  };
};

// Helper to upload avatar to Cloudinary
const uploadAvatar = async (file: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'groovely/avatars',
        transformation: [{ width: 500, height: 500, crop: 'fill' }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    uploadStream.end(file.data);
  });
};

// Creator: Create profile
export const createCreatorProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { displayName, username, bio, creatorTypes, twitter, instagram, soundcloud } = req.body;
    const files = req.files as any;
    const avatarFile = files?.avatar;

    if (!displayName || !username) {
      sendBadRequest(res, 'Display name and username are required');
      return;
    }

    let avatarUrl = null;
    if (avatarFile) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(avatarFile.mimetype)) {
        sendBadRequest(res, 'Invalid image format. Allowed: JPG, JPEG, PNG, WEBP');
        return;
      }
      if (avatarFile.size > 2 * 1024 * 1024) {
        sendBadRequest(res, 'Image size must be less than 2MB');
        return;
      }
      avatarUrl = await uploadAvatar(avatarFile);
    }

    const profile = await createCreatorProfileService(
      userId,
      displayName,
      username,
      bio || '',
      creatorTypes || [],
      twitter || null,
      instagram || null,
      soundcloud || null,
      avatarUrl
    );

    sendSuccess(res, profile, 'Creator profile created successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Username already taken') {
      sendBadRequest(res, error.message);
      return;
    }
    console.error('Create creator profile error:', error);
    sendInternalError(res);
  }
};

// Creator: Get own profile (with stats)
export const getCreatorProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const profile = await getCreatorProfileById(userId);

    if (!profile) {
      sendNotFound(res, 'Profile not found');
      return;
    }

    const stats = await getCreatorStats(userId);

    const response = {
      ...profile,
      stats
    };

    sendSuccess(res, response, 'Creator profile retrieved successfully');
  } catch (error) {
    console.error('Get creator profile error:', error);
    sendInternalError(res);
  }
};

// Creator: Update profile (includes avatar)
export const updateCreatorProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { displayName, username, bio, creatorTypes, twitter, instagram, soundcloud } = req.body;
    const files = req.files as any;
    const avatarFile = files?.avatar;

    let avatarUrl = undefined;
    if (avatarFile) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(avatarFile.mimetype)) {
        sendBadRequest(res, 'Invalid image format. Allowed: JPG, JPEG, PNG, WEBP');
        return;
      }
      if (avatarFile.size > 2 * 1024 * 1024) {
        sendBadRequest(res, 'Image size must be less than 2MB');
        return;
      }
      avatarUrl = await uploadAvatar(avatarFile);
    }

    const profile = await updateCreatorProfileService(
      userId,
      displayName,
      username,
      bio,
      creatorTypes,
      twitter,
      instagram,
      soundcloud,
      avatarUrl
    );

    sendSuccess(res, profile, 'Creator profile updated successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Username already taken') {
      sendBadRequest(res, error.message);
      return;
    }
    console.error('Update creator profile error:', error);
    sendInternalError(res);
  }
};

// Fan: Create profile
export const createFanProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { displayName, username } = req.body;
    const files = req.files as any;
    const avatarFile = files?.avatar;

    if (!displayName || !username) {
      sendBadRequest(res, 'Display name and username are required');
      return;
    }

    let avatarUrl = null;
    if (avatarFile) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(avatarFile.mimetype)) {
        sendBadRequest(res, 'Invalid image format. Allowed: JPG, JPEG, PNG, WEBP');
        return;
      }
      if (avatarFile.size > 2 * 1024 * 1024) {
        sendBadRequest(res, 'Image size must be less than 2MB');
        return;
      }
      avatarUrl = await uploadAvatar(avatarFile);
    }

    const profile = await createFanProfileService(userId, displayName, username, avatarUrl);

    sendSuccess(res, profile, 'Fan profile created successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Username already taken') {
      sendBadRequest(res, error.message);
      return;
    }
    console.error('Create fan profile error:', error);
    sendInternalError(res);
  }
};

// Fan: Get profile
export const getFanProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const profile = await getFanProfileById(userId);

    if (!profile) {
      sendNotFound(res, 'Profile not found');
      return;
    }

    sendSuccess(res, profile, 'Fan profile retrieved successfully');
  } catch (error) {
    console.error('Get fan profile error:', error);
    sendInternalError(res);
  }
};

// Fan: Update profile (includes avatar)
export const updateFanProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { displayName, username } = req.body;
    const files = req.files as any;
    const avatarFile = files?.avatar;

    let avatarUrl = undefined;
    if (avatarFile) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(avatarFile.mimetype)) {
        sendBadRequest(res, 'Invalid image format. Allowed: JPG, JPEG, PNG, WEBP');
        return;
      }
      if (avatarFile.size > 2 * 1024 * 1024) {
        sendBadRequest(res, 'Image size must be less than 2MB');
        return;
      }
      avatarUrl = await uploadAvatar(avatarFile);
    }

    const profile = await updateFanProfileService(userId, displayName, username, avatarUrl);

    sendSuccess(res, profile, 'Fan profile updated successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Username already taken') {
      sendBadRequest(res, error.message);
      return;
    }
    console.error('Update fan profile error:', error);
    sendInternalError(res);
  }
};

// Public profile by username (no auth, anyone can view)
export const getPublicProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const username = req.params.username as string;

    if (!username) {
      sendBadRequest(res, 'Username is required');
      return;
    }

    const profile = await getPublicProfileService(username);

    if (!profile) {
      sendNotFound(res, 'Profile not found');
      return;
    }

    let response = { ...profile };
    if (profile.role === 'creator') {
      const stats = await getCreatorStats(profile.id);
      response = { ...profile, stats };
    }

    sendSuccess(res, response, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get public profile error:', error);
    sendInternalError(res);
  }
};