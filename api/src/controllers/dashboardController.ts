import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { getDashboardStats, getTracksByUserIdWithStats } from '../models/trackModel';
import { sendSuccess, sendInternalError } from '../helpers/response';

export const getDashboardStatsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const stats = await getDashboardStats(userId);

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
    const tracks = await getTracksByUserIdWithStats(userId);

    const formattedTracks = tracks.map((track: any) => ({
      id: track.id,
      title: track.title,
      category: track.category,
      streams: parseInt(track.streams_count) || 0,
      earnings: parseFloat(track.total_earnings) || 0,
      status: track.status,
      created_at: track.created_at,
      cover_url: track.cover_url
    }));

    sendSuccess(res, { tracks: formattedTracks }, 'Dashboard tracks retrieved successfully');
  } catch (error) {
    console.error('Get dashboard tracks error:', error);
    sendInternalError(res);
  }
};