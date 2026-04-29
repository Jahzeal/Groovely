import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { query } from '../config/database';
import { sendSuccess, sendBadRequest, sendNotFound, sendInternalError } from '../helpers/response';

const getTrackId = (req: AuthRequest): number | null => {
  const id = req.params.id;
  if (typeof id !== 'string') {
    return null;
  }
  const parsedId = parseInt(id);
  return isNaN(parsedId) ? null : parsedId;
};

export const getLibrary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const filter = req.query.filter as string || 'all';
    const limit = parseInt(req.query.limit as string) || 50;
    
    let queryText = '';
    let params = [userId, limit];
    
    switch (filter) {
      case 'played':
        queryText = `
          SELECT DISTINCT
            t.id,
            t.title,
            t.cover_url,
            t.audio_url,
            t.category,
            u.display_name as artist_name,
            u.username as artist_username,
            'played' as type,
            ts.played_at as action_date
          FROM track_streams ts
          JOIN tracks t ON ts.track_id = t.id
          JOIN users u ON t.user_id = u.id
          WHERE ts.user_id = $1
          ORDER BY ts.played_at DESC
          LIMIT $2
        `;
        break;
        
      case 'saved':
        queryText = `
          SELECT 
            t.id,
            t.title,
            t.cover_url,
            t.audio_url,
            t.category,
            u.display_name as artist_name,
            u.username as artist_username,
            'saved' as type,
            st.created_at as action_date
          FROM saved_tracks st
          JOIN tracks t ON st.track_id = t.id
          JOIN users u ON t.user_id = u.id
          WHERE st.user_id = $1
          ORDER BY st.created_at DESC
          LIMIT $2
        `;
        break;
        
      case 'purchased':
        queryText = `
          SELECT 
            t.id,
            t.title,
            t.cover_url,
            t.audio_url,
            t.category,
            u.display_name as artist_name,
            u.username as artist_username,
            'purchased' as type,
            p.purchased_at as action_date,
            p.amount,
            p.currency
          FROM purchases p
          JOIN tracks t ON p.track_id = t.id
          JOIN users u ON t.user_id = u.id
          WHERE p.user_id = $1
          ORDER BY p.purchased_at DESC
          LIMIT $2
        `;
        break;
        
      case 'all':
      default:
        queryText = `
          SELECT * FROM (
            SELECT 
              t.id,
              t.title,
              t.cover_url,
              t.audio_url,
              t.category,
              u.display_name as artist_name,
              u.username as artist_username,
              'played' as type,
              ts.played_at as action_date,
              NULL as amount,
              NULL as currency
            FROM track_streams ts
            JOIN tracks t ON ts.track_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE ts.user_id = $1
            
            UNION ALL
            
            SELECT 
              t.id,
              t.title,
              t.cover_url,
              t.audio_url,
              t.category,
              u.display_name as artist_name,
              u.username as artist_username,
              'saved' as type,
              st.created_at as action_date,
              NULL as amount,
              NULL as currency
            FROM saved_tracks st
            JOIN tracks t ON st.track_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE st.user_id = $1
            
            UNION ALL
            
            SELECT 
              t.id,
              t.title,
              t.cover_url,
              t.audio_url,
              t.category,
              u.display_name as artist_name,
              u.username as artist_username,
              'purchased' as type,
              p.purchased_at as action_date,
              p.amount,
              p.currency
            FROM purchases p
            JOIN tracks t ON p.track_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE p.user_id = $1
          ) as combined
          ORDER BY action_date DESC
          LIMIT $2
        `;
        break;
    }
    
    const result = await query(queryText, params);
    
    sendSuccess(res, { tracks: result.rows, filter }, 'Library retrieved successfully');
  } catch (error) {
    console.error('Get library error:', error);
    sendInternalError(res);
  }
};

export const saveTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const trackId = getTrackId(req);
    
    if (!trackId) {
      sendBadRequest(res, 'Invalid track ID');
      return;
    }
    
    const trackCheck = await query('SELECT id FROM tracks WHERE id = $1', [trackId]);
    if (trackCheck.rows.length === 0) {
      sendNotFound(res, 'Track not found');
      return;
    }
    
    const existingSave = await query(
      'SELECT id FROM saved_tracks WHERE user_id = $1 AND track_id = $2',
      [userId, trackId]
    );
    
    if (existingSave.rows.length > 0) {
      sendBadRequest(res, 'Track already saved');
      return;
    }
    
    await query(
      'INSERT INTO saved_tracks (user_id, track_id) VALUES ($1, $2)',
      [userId, trackId]
    );
    
    sendSuccess(res, null, 'Track saved to library');
  } catch (error) {
    console.error('Save track error:', error);
    sendInternalError(res);
  }
};

export const removeSavedTrack = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const trackId = getTrackId(req);
    
    if (!trackId) {
      sendBadRequest(res, 'Invalid track ID');
      return;
    }
    
    const result = await query(
      'DELETE FROM saved_tracks WHERE user_id = $1 AND track_id = $2 RETURNING id',
      [userId, trackId]
    );
    
    if (result.rows.length === 0) {
      sendNotFound(res, 'Saved track not found');
      return;
    }
    
    sendSuccess(res, null, 'Track removed from library');
  } catch (error) {
    console.error('Remove saved track error:', error);
    sendInternalError(res);
  }
};