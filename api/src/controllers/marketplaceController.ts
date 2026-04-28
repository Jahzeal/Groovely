import { Request, Response } from 'express';
import { query } from '../config/database';
import { sendSuccess, sendInternalError } from '../helpers/response';

export const getTrendingTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
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