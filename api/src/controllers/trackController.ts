import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { query } from '../config/database';
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


const getTrackId = (req: AuthRequest): number | null => {
  const id = req.params.id;
  if (typeof id !== 'string') {
    return null;
  }
  const parsedId = parseInt(id);
  return isNaN(parsedId) ? null : parsedId;
};


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

    
    if (!title) {
      sendBadRequest(res, 'Title is required');
      return;
    }

    if (!category) {
      sendBadRequest(res, 'Category is required');
      return;
    }

  
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


    const parsedTags = tags ? JSON.parse(tags) : null;
    const parsedUsageRights = usageRights ? JSON.parse(usageRights) : [];


    const parsedBpm = bpm ? parseInt(bpm) : null;
    
  
    const parsedKey = key || null;
    
    const parsedIsrc = isrc || null;

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
      parsedBpm,
      parsedKey,
      parsedIsrc,
      parsedUsageRights
    );

    sendSuccess(res, track, 'Track uploaded successfully');
  } catch (error) {
    console.error('Upload track error:', error);
    sendInternalError(res);
  }
};


export const getMyTracks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    const result = await query(
      `SELECT 
        t.*,
        u.id as user_id,
        u.display_name as artist_name,
        u.username as artist_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC`,
      [userId]
    );
    
    sendSuccess(res, { tracks: result.rows }, 'Tracks retrieved successfully');
  } catch (error) {
    console.error('Get tracks error:', error);
    sendInternalError(res);
  }
};


export const getTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const trackId = getTrackId(req);

    if (!trackId) {
      sendBadRequest(res, 'Invalid track ID');
      return;
    }

    const result = await query(
      `SELECT 
        t.*,
        u.id as user_id,
        u.display_name as artist_name,
        u.username as artist_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [trackId, userId]
    );
    
    if (result.rows.length === 0) {
      sendNotFound(res, 'Track not found');
      return;
    }

    sendSuccess(res, result.rows[0], 'Track retrieved successfully');
  } catch (error) {
    if (error instanceof Error && error.message === 'Track not found') {
      sendNotFound(res, error.message);
      return;
    }
    console.error('Get track error:', error);
    sendInternalError(res);
  }
};

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