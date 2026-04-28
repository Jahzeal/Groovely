import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { query } from '../config/database';
import { sendSuccess, sendInternalError } from '../helpers/response';

export const getDashboardStatsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    const result = await query(
      `SELECT 
        COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END), 0) as streams_this_month,
        COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
          AND ts.played_at < date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END), 0) as streams_last_month,
        COALESCE(SUM(ts.earnings), 0) as total_earnings,
        COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE) THEN ts.earnings ELSE 0 END), 0) as earnings_this_month,
        COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
          AND ts.played_at < date_trunc('month', CURRENT_DATE) THEN ts.earnings ELSE 0 END), 0) as earnings_last_month,
        COUNT(DISTINCT t.id) as total_uploads,
        COALESCE(SUM(CASE WHEN t.created_at >= date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END), 0) as uploads_this_month,
        COALESCE(SUM(CASE WHEN t.created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
          AND t.created_at < date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END), 0) as uploads_last_month
       FROM users u
       LEFT JOIN tracks t ON u.id = t.user_id
       LEFT JOIN track_streams ts ON t.id = ts.track_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );
    
    let stats = {
      streams_this_month: 0,
      streams_last_month: 0,
      total_earnings: 0,
      earnings_this_month: 0,
      earnings_last_month: 0,
      total_uploads: 0,
      uploads_this_month: 0,
      uploads_last_month: 0
    };
    
    if (result.rows.length > 0) {
      stats = result.rows[0];
    }

    const calculatePercentage = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return parseFloat(((current - previous) / previous * 100).toFixed(1));
    };

    const streamsChange = calculatePercentage(stats.streams_this_month, stats.streams_last_month);
    const earningsChange = calculatePercentage(stats.earnings_this_month, stats.earnings_last_month);
    const uploadsChange = calculatePercentage(stats.uploads_this_month, stats.uploads_last_month);

    const response = {
      streams: {
        total: stats.streams_this_month,
        change: streamsChange,
        changeType: streamsChange >= 0 ? 'up' : 'down'
      },
      earnings: {
        total: stats.total_earnings,
        change: earningsChange,
        changeType: earningsChange >= 0 ? 'up' : 'down'
      },
      uploads: {
        total: stats.total_uploads,
        change: uploadsChange,
        changeType: uploadsChange >= 0 ? 'up' : 'down'
      }
    };

    sendSuccess(res, response, 'Dashboard stats retrieved successfully');
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    sendInternalError(res);
  }
};

export const getDashboardTracksController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    const result = await query(
      `SELECT 
        t.id,
        t.title,
        t.category,
        t.status,
        t.created_at,
        t.cover_url,
        t.audio_url,
        COALESCE(SUM(ts.earnings), 0) as earnings,
        COUNT(ts.id) as streams,
        u.display_name as artist_name,
        u.username as artist_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN track_streams ts ON t.id = ts.track_id
       WHERE t.user_id = $1
       GROUP BY t.id, u.display_name, u.username, t.audio_url
       ORDER BY t.created_at DESC`,
      [userId]
    );

    const formattedTracks = result.rows.map((track: any) => ({
      id: track.id,
      title: track.title,
      category: track.category,
      streams: parseInt(track.streams) || 0,
      earnings: parseFloat(track.earnings) || 0,
      status: track.status,
      created_at: track.created_at,
      cover_url: track.cover_url,
      audio_url: track.audio_url,
      artist_name: track.artist_name,
      artist_username: track.artist_username
    }));

    sendSuccess(res, { tracks: formattedTracks }, 'Dashboard tracks retrieved successfully');
  } catch (error) {
    console.error('Get dashboard tracks error:', error);
    sendInternalError(res);
  }
};