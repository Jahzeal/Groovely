import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { IpfsService } from '../ipfs/ipfs.service';

const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_AUDIO_TYPES = ['audio/mpeg']; // MP3 only
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

@Injectable()
export class TrackService {
  constructor(
    private db: DatabaseService,
    private cloudinary: CloudinaryService,
    private ipfs: IpfsService,
  ) {}

  validateAudioFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }
    if (file.size > MAX_AUDIO_SIZE) {
      throw new BadRequestException(`Audio file size must be less than ${MAX_AUDIO_SIZE / 1024 / 1024}MB`);
    }
    if (!ALLOWED_AUDIO_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only MP3 audio files are allowed');
    }
  }

  validateImageFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Cover art image is required');
    }
    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException(`Image size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`);
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Image format must be JPG, JPEG, PNG, or WEBP');
    }
  }

  async createNewTrack(
    userId: number,
    title: string,
    description: string | null,
    audioFile: Express.Multer.File,
    coverFile: Express.Multer.File,
    visibility: string,
    explicit: boolean,
    category: string,
    tags: string[] | null,
    bpm: number | null,
    key: string | null,
    isrc: string | null,
    usageRights: string[],
    paymentModel: string,
    licensePrice: number,
    royaltyPercentage: number,
  ) {
    this.validateAudioFile(audioFile);
    this.validateImageFile(coverFile);

    // Audio → IPFS (decentralized, permanent storage)
    const audioUrl = await this.ipfs.uploadFile(audioFile.buffer, audioFile.originalname, audioFile.mimetype);
    // Cover art → Cloudinary (fast CDN delivery for display in the dashboard)
    const coverUrl = await this.cloudinary.uploadFile(coverFile.buffer, 'covers', 'image');

    const result = await this.db.query(
      `INSERT INTO tracks (
        user_id, title, description, audio_url, cover_url, visibility, 
        explicit, category, tags, bpm, key, isrc, usage_rights, payment_model,
        license_price, royalty_percentage, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'draft')
      RETURNING *`,
      [
        userId, title, description, audioUrl, coverUrl, visibility || 'public',
        explicit, category, tags, bpm, key, isrc, usageRights, paymentModel || 'fixed',
        licensePrice || 0.00, royaltyPercentage || 10
      ]
    );

    return result.rows[0];
  }

  async getCreatorTracks(userId: number) {
    const result = await this.db.query(
      `SELECT DISTINCT
        t.*,
        u.id as user_id,
        u.display_name as artist_name,
        u.username as artist_username,
        CASE 
          WHEN t.user_id = $1 THEN 'creator'
          ELSE (
            SELECT sc.role 
            FROM song_contributors sc 
            JOIN songs s ON sc.song_id = s.id 
            WHERE s.track_id = t.id AND sc.user_id = $1 AND sc.approval_status = 'accepted' 
            LIMIT 1
          )
        END as contributor_role
      FROM tracks t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN songs s ON t.id = s.track_id
      LEFT JOIN song_contributors sc ON s.id = sc.song_id
      WHERE t.user_id = $1 
         OR (sc.user_id = $1 AND sc.approval_status = 'accepted')
      ORDER BY t.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async getTrackDetails(trackId: number, userId: number) {
    const result = await this.db.query(
      `SELECT 
        t.*,
        u.id as user_id,
        u.display_name as artist_name,
        u.username as artist_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.id = $1 AND t.user_id = $2`,
      [trackId, userId]
    );
    
    const track = result.rows[0];
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }

  async updateTrackDetails(trackId: number, userId: number, updates: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.visibility !== undefined) {
      fields.push(`visibility = $${paramIndex++}`);
      values.push(updates.visibility);
    }
    if (updates.explicit !== undefined) {
      fields.push(`explicit = $${paramIndex++}`);
      values.push(updates.explicit === 'true' || updates.explicit === true);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      values.push(updates.category);
    }
    if (updates.tags !== undefined) {
      fields.push(`tags = $${paramIndex++}`);
      let parsedTags = updates.tags;
      if (typeof updates.tags === 'string') {
        try { parsedTags = JSON.parse(updates.tags); } catch {}
      }
      values.push(parsedTags);
    }
    if (updates.bpm !== undefined) {
      fields.push(`bpm = $${paramIndex++}`);
      values.push(updates.bpm ? parseInt(updates.bpm) : null);
    }
    if (updates.key !== undefined) {
      fields.push(`key = $${paramIndex++}`);
      values.push(updates.key || null);
    }
    if (updates.isrc !== undefined) {
      fields.push(`isrc = $${paramIndex++}`);
      values.push(updates.isrc || null);
    }
    if (updates.usageRights !== undefined || updates.usage_rights !== undefined) {
      fields.push(`usage_rights = $${paramIndex++}`);
      let rights = updates.usageRights || updates.usage_rights;
      if (typeof rights === 'string') {
        try { rights = JSON.parse(rights); } catch {}
      }
      values.push(rights || []);
    }
    if (updates.paymentModel !== undefined || updates.payment_model !== undefined) {
      fields.push(`payment_model = $${paramIndex++}`);
      values.push(updates.paymentModel || updates.payment_model);
    }
    if (updates.licensePrice !== undefined || updates.license_price !== undefined) {
      fields.push(`license_price = $${paramIndex++}`);
      const price = updates.licensePrice !== undefined ? updates.licensePrice : updates.license_price;
      values.push(price ? parseFloat(price) : 0.0);
    }
    if (updates.royaltyPercentage !== undefined || updates.royalty_percentage !== undefined) {
      fields.push(`royalty_percentage = $${paramIndex++}`);
      const royalty = updates.royaltyPercentage !== undefined ? updates.royaltyPercentage : updates.royalty_percentage;
      values.push(royalty ? parseInt(royalty) : 10);
    }

    if (fields.length === 0) {
      return this.getTrackDetails(trackId, userId);
    }

    values.push(trackId, userId);
    const queryText = `UPDATE tracks SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`;
    
    const result = await this.db.query(queryText, values);
    const track = result.rows[0];
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return track;
  }

  async removeTrack(trackId: number, userId: number) {
    const result = await this.db.query(
      'DELETE FROM tracks WHERE id = $1 AND user_id = $2 RETURNING id',
      [trackId, userId]
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Track not found');
    }
    return true;
  }

  async recordStream(trackId: number, userId: number, earnings = 0.0001) {
    const trackCheck = await this.db.query('SELECT id FROM tracks WHERE id = $1', [trackId]);
    if (trackCheck.rows.length === 0) {
      throw new NotFoundException('Track not found');
    }

    const result = await this.db.query(
      `INSERT INTO track_streams (track_id, user_id, earnings)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [trackId, userId, earnings]
    );
    return result.rows[0];
  }

  async getLibrary(userId: number, filter: string, limit = 50) {
    let queryText = '';
    const params = [userId, limit];

    switch (filter) {
      case 'played':
        queryText = `
          SELECT * FROM (
            SELECT DISTINCT ON (t.id)
              t.id,
              t.user_id as uploader_id,
              t.title,
              t.cover_url,
              t.audio_url,
              t.category,
              u.display_name as artist_name,
              u.username as artist_username,
              'played' as type,
              ts.played_at as action_date,
              NULL::numeric as amount,
              NULL::text as currency
            FROM track_streams ts
            JOIN tracks t ON ts.track_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE ts.user_id = $1
            ORDER BY t.id, ts.played_at DESC
          ) as distinct_played
          ORDER BY action_date DESC
          LIMIT $2
        `;
        break;

      case 'saved':
        queryText = `
          SELECT * FROM (
            SELECT DISTINCT ON (t.id)
              t.id,
              t.user_id as uploader_id,
              t.title,
              t.cover_url,
              t.audio_url,
              t.category,
              u.display_name as artist_name,
              u.username as artist_username,
              'saved' as type,
              st.created_at as action_date,
              NULL::numeric as amount,
              NULL::text as currency
            FROM saved_tracks st
            JOIN tracks t ON st.track_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE st.user_id = $1
            ORDER BY t.id, st.created_at DESC
          ) as distinct_saved
          ORDER BY action_date DESC
          LIMIT $2
        `;
        break;

      case 'purchased':
        queryText = `
          SELECT * FROM (
            SELECT DISTINCT ON (t.id)
              t.id,
              t.user_id as uploader_id,
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
            JOIN editions e ON p.edition_id = e.id
            JOIN songs s ON e.song_id = s.id
            JOIN tracks t ON (p.track_id = t.id OR s.track_id = t.id)
            JOIN users u ON t.user_id = u.id
            LEFT JOIN users buyer ON p.user_id = buyer.id OR (p.buyer_wallet IS NOT NULL AND LOWER(p.buyer_wallet) = LOWER(buyer.wallet_address))
            WHERE (p.user_id = $1 OR buyer.id = $1)
              AND p.tx_hash IS NOT NULL 
              AND p.tx_hash != ''
              AND p.tx_hash NOT LIKE '0x000%'
              AND (t.status = 'active' OR t.status = 'published' OR e.contract_edition_id IS NOT NULL)
            ORDER BY t.id, p.purchased_at DESC
          ) as distinct_purchased
          ORDER BY action_date DESC
          LIMIT $2
        `;
        break;

      case 'uploaded':
        queryText = `
          SELECT * FROM (
            SELECT DISTINCT ON (t.id)
              t.id,
              t.user_id as uploader_id,
              t.title,
              t.cover_url,
              t.audio_url,
              t.category,
              u.display_name as artist_name,
              u.username as artist_username,
              'uploaded' as type,
              t.created_at as action_date,
              NULL::numeric as amount,
              NULL::text as currency
            FROM tracks t
            JOIN users u ON t.user_id = u.id
            WHERE t.user_id = $1
            ORDER BY t.id, t.created_at DESC
          ) as distinct_uploaded
          ORDER BY action_date DESC
          LIMIT $2
        `;
        break;

      case 'all':
      default:
        queryText = `
          SELECT * FROM (
            SELECT DISTINCT ON (id) *
            FROM (
              SELECT 
                t.id,
                t.user_id as uploader_id,
                t.title,
                t.cover_url,
                t.audio_url,
                t.category,
                u.display_name as artist_name,
                u.username as artist_username,
                'played' as type,
                ts.played_at as action_date,
                NULL::numeric as amount,
                NULL::text as currency
              FROM track_streams ts
              JOIN tracks t ON ts.track_id = t.id
              JOIN users u ON t.user_id = u.id
              WHERE ts.user_id = $1
              
              UNION ALL
              
              SELECT 
                t.id,
                t.user_id as uploader_id,
                t.title,
                t.cover_url,
                t.audio_url,
                t.category,
                u.display_name as artist_name,
                u.username as artist_username,
                'saved' as type,
                st.created_at as action_date,
                NULL::numeric as amount,
                NULL::text as currency
              FROM saved_tracks st
              JOIN tracks t ON st.track_id = t.id
              JOIN users u ON t.user_id = u.id
              WHERE st.user_id = $1
              
              UNION ALL
              
              SELECT 
                t.id,
                t.user_id as uploader_id,
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
              JOIN editions e ON p.edition_id = e.id
              JOIN songs s ON e.song_id = s.id
              JOIN tracks t ON (p.track_id = t.id OR s.track_id = t.id)
              JOIN users u ON t.user_id = u.id
              LEFT JOIN users buyer ON p.user_id = buyer.id OR (p.buyer_wallet IS NOT NULL AND LOWER(p.buyer_wallet) = LOWER(buyer.wallet_address))
              WHERE (p.user_id = $1 OR buyer.id = $1)
                AND p.tx_hash IS NOT NULL 
                AND p.tx_hash != ''
                AND p.tx_hash NOT LIKE '0x000%'
                AND (t.status = 'active' OR t.status = 'published' OR e.contract_edition_id IS NOT NULL)
 
              UNION ALL
 
              SELECT 
                t.id,
                t.user_id as uploader_id,
                t.title,
                t.cover_url,
                t.audio_url,
                t.category,
                u.display_name as artist_name,
                u.username as artist_username,
                'uploaded' as type,
                t.created_at as action_date,
                NULL::numeric as amount,
                NULL::text as currency
              FROM tracks t
              JOIN users u ON t.user_id = u.id
              WHERE t.user_id = $1
            ) as all_actions
            ORDER BY id, action_date DESC
          ) as unique_tracks
          ORDER BY action_date DESC
          LIMIT $2
        `;
        break;
    }

    const result = await this.db.query(queryText, params);
    return result.rows;
  }

  async saveTrack(userId: number, trackId: number) {
    const trackCheck = await this.db.query('SELECT id FROM tracks WHERE id = $1', [trackId]);
    if (trackCheck.rows.length === 0) {
      throw new NotFoundException('Track not found');
    }

    const existingSave = await this.db.query(
      'SELECT user_id FROM saved_tracks WHERE user_id = $1 AND track_id = $2',
      [userId, trackId]
    );
    if (existingSave.rows.length > 0) {
      throw new BadRequestException('Track already saved');
    }

    await this.db.query(
      'INSERT INTO saved_tracks (user_id, track_id) VALUES ($1, $2)',
      [userId, trackId]
    );
    return null;
  }

  async removeSavedTrack(userId: number, trackId: number) {
    const result = await this.db.query(
      'DELETE FROM saved_tracks WHERE user_id = $1 AND track_id = $2 RETURNING user_id',
      [userId, trackId]
    );
    if (result.rows.length === 0) {
      throw new NotFoundException('Saved track not found');
    }
    return null;
  }
}
