import { query } from '../config/database';

export interface Track {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  audio_url: string;
  cover_url: string;
  visibility: string;
  explicit: boolean;
  category: string;
  tags: string[] | null;
  bpm: number | null;
  key: string | null;
  isrc: string | null;
  usage_rights: string[];
  status: string;
  created_at: Date;
  updated_at: Date;
}

export interface TrackWithStats extends Track {
  streams_count: number;
  total_earnings: number;
}

export const createTrack = async (
  userId: number,
  title: string,
  description: string | null,
  audioUrl: string,
  coverUrl: string,
  visibility: string,
  explicit: boolean,
  category: string,
  tags: string[] | null,
  bpm: number | null,
  key: string | null,
  isrc: string | null,
  usageRights: string[]
) => {
  const result = await query(
    `INSERT INTO tracks (
      user_id, title, description, audio_url, cover_url, visibility, 
      explicit, category, tags, bpm, key, isrc, usage_rights, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'active')
    RETURNING *`,
    [
      userId, title, description, audioUrl, coverUrl, visibility,
      explicit, category, tags, bpm, key, isrc, usageRights
    ]
  );
  return result.rows[0];
};

export const getTracksByUserIdWithStats = async (userId: number) => {
  const result = await query(
    `SELECT 
      t.*,
      COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END), 0) as streams_this_month,
      COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
        AND ts.played_at < date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END), 0) as streams_last_month,
      COALESCE(SUM(ts.earnings), 0) as total_earnings,
      COALESCE(COUNT(ts.id), 0) as streams_count
     FROM tracks t
     LEFT JOIN track_streams ts ON t.id = ts.track_id
     WHERE t.user_id = $1
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const getTrackByIdWithStats = async (id: number, userId: number) => {
  const result = await query(
    `SELECT 
      t.*,
      COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END), 0) as streams_this_month,
      COALESCE(SUM(CASE WHEN ts.played_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') 
        AND ts.played_at < date_trunc('month', CURRENT_DATE) THEN 1 ELSE 0 END), 0) as streams_last_month,
      COALESCE(SUM(ts.earnings), 0) as total_earnings,
      COALESCE(COUNT(ts.id), 0) as streams_count
     FROM tracks t
     LEFT JOIN track_streams ts ON t.id = ts.track_id
     WHERE t.id = $1 AND t.user_id = $2
     GROUP BY t.id`,
    [id, userId]
  );
  return result.rows[0];
};

export const recordStream = async (trackId: number, userId: number, earnings: number = 0.0001) => {
  const result = await query(
    `INSERT INTO track_streams (track_id, user_id, earnings)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [trackId, userId, earnings]
  );
  return result.rows[0];
};

export const getDashboardStats = async (userId: number) => {
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
  
  if (result.rows.length === 0) {
    return {
      streams_this_month: 0,
      streams_last_month: 0,
      total_earnings: 0,
      earnings_this_month: 0,
      earnings_last_month: 0,
      total_uploads: 0,
      uploads_this_month: 0,
      uploads_last_month: 0
    };
  }
  
  return result.rows[0];
};

export const getTracksByUserId = async (userId: number) => {
  const result = await query(
    'SELECT * FROM tracks WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

export const getTrackById = async (id: number, userId: number) => {
  const result = await query(
    'SELECT * FROM tracks WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
  return result.rows[0];
};

export const updateTrack = async (
  id: number,
  userId: number,
  updates: Partial<Track>
) => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

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
    values.push(updates.explicit);
  }
  if (updates.category !== undefined) {
    fields.push(`category = $${paramIndex++}`);
    values.push(updates.category);
  }
  if (updates.tags !== undefined) {
    fields.push(`tags = $${paramIndex++}`);
    values.push(updates.tags);
  }
  if (updates.bpm !== undefined) {
    fields.push(`bpm = $${paramIndex++}`);
    values.push(updates.bpm);
  }
  if (updates.key !== undefined) {
    fields.push(`key = $${paramIndex++}`);
    values.push(updates.key);
  }
  if (updates.isrc !== undefined) {
    fields.push(`isrc = $${paramIndex++}`);
    values.push(updates.isrc);
  }
  if (updates.usage_rights !== undefined) {
    fields.push(`usage_rights = $${paramIndex++}`);
    values.push(updates.usage_rights);
  }

  if (fields.length === 0) {
    return getTrackById(id, userId);
  }

  values.push(id, userId);
  const result = await query(
    `UPDATE tracks SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0];
};

export const deleteTrack = async (id: number, userId: number) => {
  const result = await query(
    'DELETE FROM tracks WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId]
  );
  return result.rows[0];
};