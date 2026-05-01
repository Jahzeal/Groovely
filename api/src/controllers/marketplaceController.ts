import { Request, Response } from 'express';
import { query } from '../config/database';
import { sendSuccess, sendBadRequest, sendNotFound, sendInternalError } from '../helpers/response';


const getTrackId = (req: Request): number | null => {
  const id = req.params.id;
  if (typeof id !== 'string') {
    return null;
  }
  const parsedId = parseInt(id);
  return isNaN(parsedId) ? null : parsedId;
};


export const getTrendingTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.audio_url,
        t.price,
        t.currency,
        t.usage_rights as license_types,
        u.display_name as creator,
        u.username as creator_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.visibility = 'public'
       ORDER BY (SELECT COUNT(*) FROM track_streams WHERE track_id = t.id) DESC
       LIMIT $1`,
      [limit]
    );
    
    sendSuccess(res, { tracks: result.rows }, 'Trending tracks retrieved successfully');
  } catch (error) {
    console.error('Get trending tracks error:', error);
    sendInternalError(res);
  }
};


export const getForYouTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.audio_url,
        t.price,
        t.currency,
        t.usage_rights as license_types,
        u.display_name as creator,
        u.username as creator_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.visibility = 'public'
       ORDER BY t.created_at DESC
       LIMIT $1`,
      [limit]
    );
    
    sendSuccess(res, { tracks: result.rows }, 'Recommended tracks retrieved successfully');
  } catch (error) {
    console.error('Get for you tracks error:', error);
    sendInternalError(res);
  }
};


export const getTracksByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = req.params.category;
    const limit = parseInt(req.query.limit as string) || 20;
    
    let categoryFilter = '';
    if (category !== 'all') {
      categoryFilter = 'AND t.category = $2';
    }
    
    const queryText = `
      SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.audio_url,
        t.price,
        t.currency,
        t.usage_rights as license_types,
        u.display_name as creator,
        u.username as creator_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.visibility = 'public'
       ${categoryFilter}
       ORDER BY t.created_at DESC
       LIMIT $1
    `;
    
    const params = category !== 'all' ? [limit, category] : [limit];
    const result = await query(queryText, params);
    
    sendSuccess(res, { tracks: result.rows, category }, 'Tracks retrieved successfully');
  } catch (error) {
    console.error('Get tracks by category error:', error);
    sendInternalError(res);
  }
};


export const getTrackDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const trackId = getTrackId(req);
    
    if (!trackId) {
      sendBadRequest(res, 'Invalid track ID');
      return;
    }
    
    
    const trackResult = await query(
      `SELECT 
        t.id,
        t.title,
        t.description,
        t.cover_url,
        t.audio_url,
        t.category,
        t.bpm,
        t.key,
        t.price,
        t.currency,
        t.usage_rights as license_types,
        t.created_at,
        u.id as creator_id,
        u.display_name as creator_name,
        u.username as creator_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1 AND t.visibility = 'public'`,
      [trackId]
    );
    
    if (trackResult.rows.length === 0) {
      sendNotFound(res, 'Track not found');
      return;
    }
    
    const track = trackResult.rows[0];
    
    const moreResult = await query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.price,
        t.currency,
        t.usage_rights as license_types
       FROM tracks t
       WHERE t.user_id = $1 AND t.id != $2 AND t.visibility = 'public'
       ORDER BY t.created_at DESC
       LIMIT 4`,
      [track.creator_id, trackId]
    );
    
    const response = {
      track: {
        id: track.id,
        title: track.title,
        description: track.description,
        cover_url: track.cover_url,
        audio_url: track.audio_url,
        category: track.category,
        bpm: track.bpm,
        key: track.key,
        price: track.price,
        currency: track.currency,
        license_types: track.license_types,
        created_at: track.created_at
      },
      creator: {
        id: track.creator_id,
        name: track.creator_name,
        username: track.creator_username
      },
      more_from_creator: moreResult.rows
    };
    
    sendSuccess(res, response, 'Track details retrieved successfully');
  } catch (error) {
    console.error('Get track details error:', error);
    sendInternalError(res);
  }
};