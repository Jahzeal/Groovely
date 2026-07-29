import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CreatorService {
  constructor(private db: DatabaseService) {}

  async getDashboardStats(userId: number) {
    const result = await this.db.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END), 0) as streams_this_month,
        COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
          AND ts.played_at < date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END), 0) as streams_last_month,
        COALESCE(SUM(ts.earnings), 0) as total_stream_earnings,
        COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE) THEN ts.earnings ELSE 0 END), 0) as stream_earnings_this_month,
        COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
          AND ts.played_at < date_trunc('month', CURRENT_DATE) THEN ts.earnings ELSE 0 END), 0) as stream_earnings_last_month,
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

    const purchaseResult = await this.db.query(
      `SELECT
        COALESCE(SUM(p.amount), 0) as total_purchase_earnings,
        COALESCE(SUM(CASE WHEN p.purchased_at >= date_trunc('month', CURRENT_DATE) THEN p.amount ELSE 0 END), 0) as purchase_earnings_this_month,
        COALESCE(SUM(CASE WHEN p.purchased_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
          AND p.purchased_at < date_trunc('month', CURRENT_DATE) THEN p.amount ELSE 0 END), 0) as purchase_earnings_last_month
       FROM purchases p
       LEFT JOIN editions e ON p.edition_id = e.id
       LEFT JOIN songs s ON (e.song_id = s.id OR p.track_id = s.id OR p.track_id = s.track_id)
       LEFT JOIN tracks t ON (s.track_id = t.id OR p.track_id = t.id)
       WHERE t.user_id = $1 OR s.user_id = $1`,
      [userId]
    );

    let stats = {
      streams_this_month: 0,
      streams_last_month: 0,
      total_stream_earnings: 0,
      stream_earnings_this_month: 0,
      stream_earnings_last_month: 0,
      total_uploads: 0,
      uploads_this_month: 0,
      uploads_last_month: 0
    };

    if (result.rows.length > 0) {
      stats = result.rows[0];
    }

    const pStats = purchaseResult.rows[0] || {
      total_purchase_earnings: 0,
      purchase_earnings_this_month: 0,
      purchase_earnings_last_month: 0
    };

    const totalEarnings = parseFloat(stats.total_stream_earnings as any) + parseFloat(pStats.total_purchase_earnings as any);
    const earningsThisMonth = parseFloat(stats.stream_earnings_this_month as any) + parseFloat(pStats.purchase_earnings_this_month as any);
    const earningsLastMonth = parseFloat(stats.stream_earnings_last_month as any) + parseFloat(pStats.purchase_earnings_last_month as any);

    const calculatePercentage = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      return parseFloat(((current - previous) / previous * 100).toFixed(1));
    };

    const streamsChange = calculatePercentage(
      parseInt(stats.streams_this_month as any),
      parseInt(stats.streams_last_month as any)
    );
    const earningsChange = calculatePercentage(earningsThisMonth, earningsLastMonth);
    const uploadsChange = calculatePercentage(
      parseInt(stats.uploads_this_month as any),
      parseInt(stats.uploads_last_month as any)
    );

    return {
      streams: {
        total: parseInt(stats.streams_this_month as any),
        change: streamsChange,
        changeType: streamsChange >= 0 ? 'up' : 'down'
      },
      earnings: {
        total: totalEarnings,
        thisMonth: earningsThisMonth,
        lastMonth: earningsLastMonth,
        change: earningsChange,
        changeType: earningsChange >= 0 ? 'up' : 'down'
      },
      uploads: {
        total: parseInt(stats.total_uploads as any),
        change: uploadsChange,
        changeType: uploadsChange >= 0 ? 'up' : 'down'
      }
    };
  }

  async getDashboardTracks(userId: number) {
    const result = await this.db.query(
      `SELECT 
        t.id,
        t.title,
        t.category,
        t.status,
        t.created_at,
        t.cover_url,
        t.audio_url,
        (
          COALESCE((SELECT SUM(earnings) FROM track_streams WHERE track_id = t.id), 0) +
          COALESCE((SELECT SUM(amount) FROM purchases WHERE track_id = t.id OR track_id IN (SELECT id FROM songs WHERE track_id = t.id)), 0)
        ) as earnings,
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

    return result.rows.map((track: any) => ({
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
  }

  async getTransactions(userId: number) {
    const result = await this.db.query(
      `SELECT 
         p.id,
         COALESCE(p.license_type, 'NFT Sale') as type,
         COALESCE(t.title, s.title, 'Track Sale') as title,
         COALESCE(t.category, 'Music') as content,
         p.amount,
         p.purchased_at as date,
         'Completed' as status,
         COALESCE(t.cover_url, '') as image
       FROM purchases p
       LEFT JOIN editions e ON p.edition_id = e.id
       LEFT JOIN songs s ON (e.song_id = s.id OR p.track_id = s.id OR p.track_id = s.track_id)
       LEFT JOIN tracks t ON (s.track_id = t.id OR p.track_id = t.id)
       WHERE t.user_id = $1 OR s.user_id = $1
       ORDER BY p.purchased_at DESC
       LIMIT 50`,
      [userId]
    );
    return result.rows;
  }
}
