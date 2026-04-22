import { Response } from 'express';
import { AuthRequest } from '../types/request';
import {
  validateUsername,
  validateDisplayName,
  validateBio,
  validateCreatorTypes,
  createCreatorProfile,
  updateCreatorProfile,
  getCreatorProfileById,
  createFanProfile,
  updateFanProfile,
  getFanProfileById,
  getPublicProfile
} from '../services/profileService';
import { sendSuccess, sendBadRequest, sendNotFound, sendInternalError } from '../helpers/response';

export const createCreatorProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { displayName, username, bio, creatorTypes, twitter, instagram, soundcloud } = req.body;

    const displayNameValidation = validateDisplayName(displayName);
    if (!displayNameValidation.valid) {
      sendBadRequest(res, displayNameValidation.error!);
      return;
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      sendBadRequest(res, usernameValidation.error!);
      return;
    }

    const bioValidation = validateBio(bio || '');
    if (!bioValidation.valid) {
      sendBadRequest(res, bioValidation.error!);
      return;
    }

    const creatorTypesValidation = validateCreatorTypes(creatorTypes || []);
    if (!creatorTypesValidation.valid) {
      sendBadRequest(res, creatorTypesValidation.error!);
      return;
    }

    const profile = await createCreatorProfile(
      userId,
      displayName,
      username,
      bio || '',
      creatorTypes,
      twitter || null,
      instagram || null,
      soundcloud || null
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

export const getCreatorProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const profile = await getCreatorProfileById(userId);
    sendSuccess(res, profile, 'Creator profile retrieved successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Profile not found') {
      sendNotFound(res, error.message);
      return;
    }
    console.error('Get creator profile error:', error);
    sendInternalError(res);
  }
};

export const updateCreatorProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { displayName, username, bio, creatorTypes, twitter, instagram, soundcloud } = req.body;

    const displayNameValidation = validateDisplayName(displayName);
    if (!displayNameValidation.valid) {
      sendBadRequest(res, displayNameValidation.error!);
      return;
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      sendBadRequest(res, usernameValidation.error!);
      return;
    }

    const bioValidation = validateBio(bio || '');
    if (!bioValidation.valid) {
      sendBadRequest(res, bioValidation.error!);
      return;
    }

    const creatorTypesValidation = validateCreatorTypes(creatorTypes || []);
    if (!creatorTypesValidation.valid) {
      sendBadRequest(res, creatorTypesValidation.error!);
      return;
    }

    const profile = await updateCreatorProfile(
      userId,
      displayName,
      username,
      bio || '',
      creatorTypes,
      twitter || null,
      instagram || null,
      soundcloud || null
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


export const createFanProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { displayName, username } = req.body;

    const displayNameValidation = validateDisplayName(displayName);
    if (!displayNameValidation.valid) {
      sendBadRequest(res, displayNameValidation.error!);
      return;
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      sendBadRequest(res, usernameValidation.error!);
      return;
    }

    const profile = await createFanProfile(userId, displayName, username);
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


export const getFanProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const profile = await getFanProfileById(userId);
    sendSuccess(res, profile, 'Fan profile retrieved successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Profile not found') {
      sendNotFound(res, error.message);
      return;
    }
    console.error('Get fan profile error:', error);
    sendInternalError(res);
  }
};

export const updateFanProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { displayName, username } = req.body;

    const displayNameValidation = validateDisplayName(displayName);
    if (!displayNameValidation.valid) {
      sendBadRequest(res, displayNameValidation.error!);
      return;
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      sendBadRequest(res, usernameValidation.error!);
      return;
    }

    const profile = await updateFanProfile(userId, displayName, username);
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

export const getPublicProfileController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const username = req.params.username as string;
    
    if (!username) {
      sendBadRequest(res, 'Username is required');
      return;
    }
    
    const profile = await getPublicProfile(username);
    sendSuccess(res, profile, 'Profile retrieved successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Profile not found') {
      sendNotFound(res, error.message);
      return;
    }
    console.error('Get public profile error:', error);
    sendInternalError(res);
  }
};