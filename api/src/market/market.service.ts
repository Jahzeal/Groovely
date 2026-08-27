import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MarketService {
  constructor(private db: DatabaseService) {}

  async getTrendingTracks(limit = 10) {
    const result = await this.db.query(
      `SELECT 
        t.id,
        t.user_id as user_id,
        t.title,
        t.cover_url,
        t.audio_url,
        t.price,
        t.currency,
        t.usage_rights as license_types,
        t.category,
        t.tags,
        u.display_name as creator,
        u.username as creator_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.visibility = 'public'
         AND EXISTS (SELECT 1 FROM songs s WHERE s.track_id = t.id AND s.status = 'published')
       ORDER BY (SELECT COUNT(*) FROM track_streams WHERE track_id = t.id) DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async getForYouTracks(limit = 10) {
    const result = await this.db.query(
      `SELECT 
        t.id,
        t.user_id as user_id,
        t.title,
        t.cover_url,
        t.audio_url,
        t.price,
        t.currency,
        t.usage_rights as license_types,
        t.category,
        t.tags,
        u.display_name as creator,
        u.username as creator_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.visibility = 'public'
         AND EXISTS (SELECT 1 FROM songs s WHERE s.track_id = t.id AND s.status = 'published')
       ORDER BY t.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  async getTracksByCategory(category: string, limit = 20) {
    let categoryFilter = '';
    if (category !== 'all') {
      categoryFilter = 'AND t.category = $2';
    }

    const queryText = `
      SELECT 
        t.id,
        t.user_id as user_id,
        t.title,
        t.cover_url,
        t.audio_url,
        t.price,
        t.currency,
        t.usage_rights as license_types,
        t.category,
        t.tags,
        u.display_name as creator,
        u.username as creator_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.visibility = 'public'
         AND EXISTS (SELECT 1 FROM songs s WHERE s.track_id = t.id AND s.status = 'published')
       ${categoryFilter}
       ORDER BY t.created_at DESC
       LIMIT $1
     `;

    const params = category !== 'all' ? [limit, category] : [limit];
    const result = await this.db.query(queryText, params);
    return result.rows;
  }

  async getTrackDetails(trackId: number) {
    const trackResult = await this.db.query(
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
        t.license_price,
        t.royalty_percentage,
        t.currency,
        t.usage_rights as license_types,
        t.created_at,
        u.id as creator_id,
        u.display_name as creator_name,
        u.username as creator_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1 
         AND t.visibility = 'public'
         AND EXISTS (SELECT 1 FROM songs s WHERE s.track_id = t.id AND s.status = 'published')`,
      [trackId]
    );

    const track = trackResult.rows[0];
    if (!track) {
      throw new NotFoundException('Track not found');
    }

    const moreResult = await this.db.query(
      `SELECT 
        t.id,
        t.title,
        t.cover_url,
        t.price,
        t.license_price,
        t.currency,
        t.usage_rights as license_types
       FROM tracks t
       WHERE t.user_id = $1 AND t.id != $2 
         AND t.visibility = 'public'
         AND EXISTS (SELECT 1 FROM songs s WHERE s.track_id = t.id AND s.status = 'published')
       ORDER BY t.created_at DESC
       LIMIT 4`,
      [track.creator_id, trackId]
    );

    const editionResult = await this.db.query(
      `SELECT 
        e.id, 
        e.contract_edition_id, 
        e.edition_type, 
        e.max_supply, 
        e.minted_supply, 
        e.mint_price_usdc,
        e.active
       FROM editions e
       JOIN songs s ON e.song_id = s.id
       WHERE s.track_id = $1 AND e.active = true`,
      [trackId]
    );

    return {
      track: {
        id: track.id,
        user_id: track.creator_id,
        title: track.title,
        description: track.description,
        cover_url: track.cover_url,
        audio_url: track.audio_url,
        category: track.category,
        bpm: track.bpm,
        key: track.key,
        price: track.license_price || track.price || '5.00',
        license_price: track.license_price,
        royalty_percentage: track.royalty_percentage,
        currency: track.currency,
        license_types: track.license_types,
        created_at: track.created_at
      },
      creator: {
        id: track.creator_id,
        name: track.creator_name,
        username: track.creator_username
      },
      more_from_creator: moreResult.rows,
      editions: editionResult.rows
    };
  }
}
