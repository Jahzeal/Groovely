import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { query } from '../config/database';
import { sendSuccess, sendBadRequest, sendNotFound, sendInternalError } from '../helpers/response';


const getUserId = (req: AuthRequest): number | null => {
  const id = req.params.id;
  if (typeof id !== 'string') {
    return null;
  }
  const parsedId = parseInt(id);
  return isNaN(parsedId) ? null : parsedId;
};


export const getTrendingTracks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.category,
        u.display_name as artist_name,
        u.username as artist_username,
        COUNT(ts.id) as stream_count
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN track_streams ts ON t.id = ts.track_id AND ts.played_at >= NOW() - INTERVAL '7 days'
       WHERE t.visibility = 'public'
       GROUP BY t.id, u.display_name, u.username
       ORDER BY stream_count DESC
       LIMIT $1`,
      [limit]
    );
    
    sendSuccess(res, { tracks: result.rows }, 'Trending tracks retrieved successfully');
  } catch (error) {
    console.error('Get trending tracks error:', error);
    sendInternalError(res);
  }
};

export const getRecentTracks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.category,
        t.created_at,
        u.display_name as artist_name,
        u.username as artist_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.visibility = 'public'
       ORDER BY t.created_at DESC
       LIMIT $1`,
      [limit]
    );
    
    sendSuccess(res, { tracks: result.rows }, 'Recent tracks retrieved successfully');
  } catch (error) {
    console.error('Get recent tracks error:', error);
    sendInternalError(res);
  }
};


export const getCreators = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const result = await query(
      `SELECT 
        u.id,
        u.display_name as name,
        u.username,
        u.bio,
        u.display_name,
        (SELECT COUNT(*) FROM tracks WHERE user_id = u.id AND visibility = 'public') as track_count,
        CASE WHEN f.id IS NOT NULL THEN true ELSE false END as is_following
       FROM users u
       LEFT JOIN follows f ON f.following_id = u.id AND f.follower_id = $1
       WHERE u.role = 'creator'
       ORDER BY u.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    
    sendSuccess(res, { creators: result.rows }, 'Creators retrieved successfully');
  } catch (error) {
    console.error('Get creators error:', error);
    sendInternalError(res);
  }
};

export const followCreator = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followerId = req.userId;
    const followingId = getUserId(req);
    
    if (!followingId) {
      sendBadRequest(res, 'Invalid creator ID');
      return;
    }
    
    if (followerId === followingId) {
      sendBadRequest(res, 'You cannot follow yourself');
      return;
    }
    
    const creatorCheck = await query('SELECT id FROM users WHERE id = $1 AND role = $2', [followingId, 'creator']);
    if (creatorCheck.rows.length === 0) {
      sendNotFound(res, 'Creator not found');
      return;
    }
    
    const existingFollow = await query(
      'SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    
    if (existingFollow.rows.length > 0) {
      sendBadRequest(res, 'Already following this creator');
      return;
    }
    
    await query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
      [followerId, followingId]
    );
    
    sendSuccess(res, null, 'Creator followed successfully');
  } catch (error) {
    console.error('Follow creator error:', error);
    sendInternalError(res);
  }
};


export const unfollowCreator = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followerId = req.userId;
    const followingId = getUserId(req);
    
    if (!followingId) {
      sendBadRequest(res, 'Invalid creator ID');
      return;
    }
    
    const result = await query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING id',
      [followerId, followingId]
    );
    
    if (result.rows.length === 0) {
      sendNotFound(res, 'Follow relationship not found');
      return;
    }
    
    sendSuccess(res, null, 'Creator unfollowed successfully');
  } catch (error) {
    console.error('Unfollow creator error:', error);
    sendInternalError(res);
  }
};


export const getRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.category,
        u.display_name as artist_name,
        u.username as artist_username,
        CASE WHEN f.id IS NOT NULL THEN true ELSE false END as follows_artist
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN follows f ON f.following_id = u.id AND f.follower_id = $1
       WHERE t.visibility = 'public'
       ORDER BY 
         CASE WHEN f.id IS NOT NULL THEN 1 ELSE 2 END,
         t.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    
    sendSuccess(res, { recommendations: result.rows }, 'Recommendations retrieved successfully');
  } catch (error) {
    console.error('Get recommendations error:', error);
    sendInternalError(res);
  }
};