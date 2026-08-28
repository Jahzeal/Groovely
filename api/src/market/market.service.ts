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

  async getForYouTracks(userId?: number, limit = 10) {
    if (userId) {
      try {
        // Step 1: Discover user's top categories from streams & saved tracks
        const topCategoriesRes = await this.db.query(
          `SELECT category, SUM(weight) as total_weight
           FROM (
             SELECT t.category, COUNT(*) * 2 as weight
             FROM track_streams ts
             JOIN tracks t ON ts.track_id = t.id
             WHERE ts.user_id = $1 AND t.category IS NOT NULL
             GROUP BY t.category

             UNION ALL

             SELECT t.category, COUNT(*) * 5 as weight
             FROM saved_tracks st
             JOIN tracks t ON st.track_id = t.id
             WHERE st.user_id = $1 AND t.category IS NOT NULL
             GROUP BY t.category
           ) combined
           GROUP BY category
           ORDER BY total_weight DESC
           LIMIT 3`,
          [userId]
        );

        const topCats = topCategoriesRes.rows.map(r => r.category);

        if (topCats.length > 0) {
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
              u.username as creator_username,
              (
                -- Category affinity score
                CASE 
                  WHEN t.category = $2 THEN 50
                  WHEN t.category = $3 THEN 30
                  WHEN t.category = $4 THEN 15
                  ELSE 0
                END
                -- Follower affinity bonus
                + (CASE WHEN EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = $1 AND f.following_id = t.user_id) THEN 30 ELSE 0 END)
                -- Saved track affinity bonus
                + (CASE WHEN EXISTS (SELECT 1 FROM saved_tracks st WHERE st.user_id = $1 AND st.track_id = t.id) THEN 20 ELSE 0 END)
                -- Global stream popularity weight
                + (SELECT COUNT(*) FROM track_streams ts WHERE ts.track_id = t.id) * 2
                -- Overplay demotion (demote heavily played tracks to promote fresh discovery)
                - (SELECT COUNT(*) FROM track_streams ts WHERE ts.user_id = $1 AND ts.track_id = t.id) * 5
              ) as recommendation_score
             FROM tracks t
             JOIN users u ON t.user_id = u.id
             WHERE t.visibility = 'public'
               AND EXISTS (SELECT 1 FROM songs s WHERE s.track_id = t.id AND s.status = 'published')
             ORDER BY recommendation_score DESC, t.created_at DESC
             LIMIT $5`,
            [
              userId,
              topCats[0] || '',
              topCats[1] || '',
              topCats[2] || '',
              limit,
            ]
          );
          if (result.rows.length > 0) {
            return result.rows;
          }
        }
      } catch (err) {
        console.error('Error fetching personalized recommendation for-you:', err);
      }
    }

    // Cold-start fallback for guests or new users:
    // Ranked blend of total stream popularity + recency
    const fallbackRes = await this.db.query(
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
       ORDER BY 
         (SELECT COUNT(*) FROM track_streams WHERE track_id = t.id) DESC,
         t.id ASC
       LIMIT $1`,
      [limit]
    );
    return fallbackRes.rows;
  }

  async getTracksByCategory(category: string, limit = 20) {
    let categoryFilter = '';
    const cleanCat = category ? category.toLowerCase().trim() : 'all';
    let params: any[] = [limit];

    if (cleanCat !== 'all') {
      if (cleanCat === 'beats' || cleanCat === 'beat') {
        categoryFilter = 'AND (LOWER(t.category) = $2 OR LOWER(t.category) = $3)';
        params = [limit, 'beat', 'beats'];
      } else if (cleanCat === 'podcasts' || cleanCat === 'podcast') {
        categoryFilter = 'AND (LOWER(t.category) = $2 OR LOWER(t.category) = $3)';
        params = [limit, 'podcast', 'podcasts'];
      } else if (cleanCat === 'skits' || cleanCat === 'skit') {
        categoryFilter = 'AND (LOWER(t.category) = $2 OR LOWER(t.category) = $3)';
        params = [limit, 'skit', 'skits'];
      } else {
        categoryFilter = 'AND LOWER(t.category) = $2';
        params = [limit, cleanCat];
      }
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
