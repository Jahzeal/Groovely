import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class FanService {
  constructor(private db: DatabaseService) { }

  async getTrendingTracks(limit = 10) {
    const result = await this.db.query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.audio_url,
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
    return result.rows;
  }

  async getRecentTracks(limit = 10) {
    const result = await this.db.query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.audio_url,
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
    return result.rows;
  }

  async getCreators(userId: number, limit = 20) {
    const result = await this.db.query(
      `SELECT 
        u.id,
        u.display_name as name,
        u.username,
        u.bio,
        u.display_name,
        (SELECT COUNT(*) FROM tracks WHERE user_id = u.id AND visibility = 'public') as track_count,
        CASE WHEN f.follower_id IS NOT NULL THEN true ELSE false END as is_following
       FROM users u
       LEFT JOIN follows f ON f.following_id = u.id AND f.follower_id = $1
       WHERE LOWER(u.role) = 'creator'
       ORDER BY u.created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return result.rows;
  }

  async followCreator(followerId: number, followingId: number) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const creatorCheck = await this.db.query(
      'SELECT id FROM users WHERE id = $1 AND role = $2',
      [followingId, 'creator']
    );
    if (creatorCheck.rows.length === 0) {
      throw new NotFoundException('Creator not found');
    }

    const existingFollow = await this.db.query(
      'SELECT follower_id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    if (existingFollow.rows.length > 0) {
      throw new BadRequestException('Already following this creator');
    }

    await this.db.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
      [followerId, followingId]
    );
    return null;
  }

  async unfollowCreator(followerId: number, followingId: number) {
    const result = await this.db.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING follower_id',
      [followerId, followingId]
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Follow relationship not found');
    }
    return null;
  }

  async getRecommendations(userId: number, limit = 10) {
    const result = await this.db.query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.audio_url,
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
    return result.rows;
  }
}
