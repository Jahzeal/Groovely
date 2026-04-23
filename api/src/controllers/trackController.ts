import { Response } from 'express';
import { AuthRequest } from '../types/request';
import {
  validateAudioFile,
  validateImageFile,
  createNewTrack,
  getCreatorTracks,
  getTrackDetails,
  updateTrackDetails,
  removeTrack
} from '../services/trackService';
import { sendSuccess, sendBadRequest, sendNotFound, sendInternalError } from '../helpers/response';

// Helper to get id from params
const getTrackId = (req: AuthRequest): number | null => {
  const id = req.params.id;
  if (typeof id !== 'string') {
    return null;
  }
  const parsedId = parseInt(id);
  return isNaN(parsedId) ? null : parsedId;
};

// Upload a new track
export const uploadTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const files = req.files as any;
    const {
      title,
      description,
      visibility,
      explicit,
      category,
      tags,
      bpm,
      key,
      isrc,
      usageRights
    } = req.body;

    // Validate required fields
    if (!title) {
      sendBadRequest(res, 'Title is required');
      return;
    }

    if (!category) {
      sendBadRequest(res, 'Category is required');
      return;
    }

    // Validate files
    const audioFile = files?.audio;
    const coverFile = files?.cover;

    const audioValidation = validateAudioFile(audioFile);
    if (!audioValidation.valid) {
      sendBadRequest(res, audioValidation.error!);
      return;
    }

    const coverValidation = validateImageFile(coverFile);
    if (!coverValidation.valid) {
      sendBadRequest(res, coverValidation.error!);
      return;
    }

    // Parse JSON fields
    const parsedTags = tags ? JSON.parse(tags) : null;
    const parsedUsageRights = usageRights ? JSON.parse(usageRights) : [];

    // Create track
    const track = await createNewTrack(
      userId,
      title,
      description || null,
      audioFile,
      coverFile,
      visibility || 'public',
      explicit === 'true' || explicit === true,
      category,
      parsedTags,
      bpm ? parseInt(bpm) : null,
      key || null,
      isrc || null,
      parsedUsageRights
    );

    sendSuccess(res, track, 'Track uploaded successfully');
  } catch (error) {
    console.error('Upload track error:', error);
    sendInternalError(res);
  }
};

// Get all tracks for the authenticated creator
export const getMyTracks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const tracks = await getCreatorTracks(userId);
    sendSuccess(res, tracks, 'Tracks retrieved successfully');
  } catch (error) {
    console.error('Get tracks error:', error);
    sendInternalError(res);
  }
};

// Get a single track by ID
export const getTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const trackId = getTrackId(req);

    if (!trackId) {
      sendBadRequest(res, 'Invalid track ID');
      return;
    }

    const track = await getTrackDetails(trackId, userId);
    sendSuccess(res, track, 'Track retrieved successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Track not found') {
      sendNotFound(res, error.message);
      return;
    }
    console.error('Get track error:', error);
    sendInternalError(res);
  }
};

// Update a track
export const updateTrackController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const trackId = getTrackId(req);
    const updates = req.body;

    if (!trackId) {
      sendBadRequest(res, 'Invalid track ID');
      return;
    }

    const track = await updateTrackDetails(trackId, userId, updates);
    sendSuccess(res, track, 'Track updated successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Track not found') {
      sendNotFound(res, error.message);
      return;
    }
    console.error('Update track error:', error);
    sendInternalError(res);
  }
};

// Delete a track
export const deleteTrackController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const trackId = getTrackId(req);

    if (!trackId) {
      sendBadRequest(res, 'Invalid track ID');
      return;
    }

    await removeTrack(trackId, userId);
    sendSuccess(res, null, 'Track deleted successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Track not found') {
      sendNotFound(res, error.message);
      return;
    }
    console.error('Delete track error:', error);
    sendInternalError(res);
  }
};