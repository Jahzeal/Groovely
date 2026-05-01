import { Response } from 'express';
import { AuthRequest } from '../types/request';
import { query } from '../config/database';
import { sendSuccess, sendInternalError } from '../helpers/response';

const getMonthlyData = async (userId: number, valueType: 'plays' | 'earnings' | 'listeners') => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const values = new Array(12).fill(0);
  
  let queryText = '';
  
  if (valueType === 'plays') {
    queryText = `
      SELECT 
        EXTRACT(MONTH FROM ts.played_at) as month,
        COUNT(ts.id) as total
      FROM track_streams ts
      JOIN tracks t ON ts.track_id = t.id
      WHERE t.user_id = $1 AND EXTRACT(YEAR FROM ts.played_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY EXTRACT(MONTH FROM ts.played_at)
    `;
  } else if (valueType === 'earnings') {
    queryText = `
      SELECT 
        EXTRACT(MONTH FROM ts.played_at) as month,
        COALESCE(SUM(ts.earnings), 0) as total
      FROM track_streams ts
      JOIN tracks t ON ts.track_id = t.id
      WHERE t.user_id = $1 AND EXTRACT(YEAR FROM ts.played_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY EXTRACT(MONTH FROM ts.played_at)
    `;
  } else {
   
    queryText = `
      SELECT 
        EXTRACT(MONTH FROM ts.played_at) as month,
        COUNT(DISTINCT ts.user_id) as total
      FROM track_streams ts
      JOIN tracks t ON ts.track_id = t.id
      WHERE t.user_id = $1 AND EXTRACT(YEAR FROM ts.played_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY EXTRACT(MONTH FROM ts.played_at)
    `;
  }
  
  const result = await query(queryText, [userId]);
  
  for (const row of result.rows) {
    const monthIndex = parseInt(row.month) - 1;
    values[monthIndex] = parseFloat(row.total);
  }
  
  return { labels: months, values };
};


export const getPlaysAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const data = await getMonthlyData(userId, 'plays');
    sendSuccess(res, data, 'Plays analytics retrieved successfully');
  } catch (error) {
    console.error('Get plays analytics error:', error);
    sendInternalError(res);
  }
};


export const getEarningsAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const data = await getMonthlyData(userId, 'earnings');
    sendSuccess(res, data, 'Earnings analytics retrieved successfully');
  } catch (error) {
    console.error('Get earnings analytics error:', error);
    sendInternalError(res);
  }
};


export const getListenersAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const data = await getMonthlyData(userId, 'listeners');
    sendSuccess(res, data, 'Listeners analytics retrieved successfully');
  } catch (error) {
    console.error('Get listeners analytics error:', error);
    sendInternalError(res);
  }
};


export const getTopTracks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    
    
    const mostStreamsResult = await query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        COUNT(ts.id) as streams,
        COALESCE(SUM(ts.earnings), 0) as earnings
       FROM tracks t
       LEFT JOIN track_streams ts ON t.id = ts.track_id
       WHERE t.user_id = $1
       GROUP BY t.id
       ORDER BY streams DESC
       LIMIT 1`,
      [userId]
    );
    

    const mostEarningsResult = await query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        COUNT(ts.id) as streams,
        COALESCE(SUM(ts.earnings), 0) as earnings
       FROM tracks t
       LEFT JOIN track_streams ts ON t.id = ts.track_id
       WHERE t.user_id = $1
       GROUP BY t.id
       ORDER BY earnings DESC
       LIMIT 1`,
      [userId]
    );
    
    const bestTrackResult = await query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        COUNT(ts.id) as streams,
        COALESCE(SUM(ts.earnings), 0) as earnings
       FROM tracks t
       LEFT JOIN track_streams ts ON t.id = ts.track_id
       WHERE t.user_id = $1
       GROUP BY t.id
       ORDER BY streams DESC, earnings DESC
       LIMIT 1`,
      [userId]
    );
    
    const response = {
      most_streams: mostStreamsResult.rows[0] || null,
      most_earnings: mostEarningsResult.rows[0] || null,
      best_track: bestTrackResult.rows[0] || null
    };
    
    sendSuccess(res, response, 'Top tracks retrieved successfully');
  } catch (error) {
    console.error('Get top tracks error:', error);
    sendInternalError(res);
  }
};