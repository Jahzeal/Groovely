import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { recordStream } from '../models/trackModel';
import { sendSuccess, sendBadRequest, sendNotFound, sendInternalError } from '../helpers/response';
import { query } from '../config/database';

const getTrackId = (req: AuthRequest): number | null => {
  const id = req.params.id;
  if (typeof id !== 'string') {
    return null;
  }
  const parsedId = parseInt(id);
  return isNaN(parsedId) ? null : parsedId;
};

export const recordStreamController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const trackId = getTrackId(req);

    if (!trackId) {
      sendBadRequest(res, 'Invalid track ID');
      return;
    }

    const trackResult = await query('SELECT id FROM tracks WHERE id = $1', [trackId]);
    
    if (trackResult.rows.length === 0) {
      sendNotFound(res, 'Track not found');
      return;
    }

    const earnings = 0.0001;
    const stream = await recordStream(trackId, userId, earnings);

    sendSuccess(res, { stream_id: stream.id, earnings }, 'Stream recorded successfully');
  } catch (error) {
    console.error('Record stream error:', error);
    sendInternalError(res);
  }
};