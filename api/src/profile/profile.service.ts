import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

const USERNAME_REGEX = /^[A-Za-z][A-Za-z0-9_]{2,29}$/;
const DISPLAY_NAME_REGEX = /^.{2,50}$/;
const MAX_BIO_LENGTH = 160;
const VALID_CREATOR_TYPES = [
  'skit makers', 'podcasters', 'artists', 'producers',
  'skit_maker', 'podcaster', 'artist', 'producer', 'dj'
];

@Injectable()
export class ProfileService {
  constructor(
    private db: DatabaseService,
    private cloudinary: CloudinaryService
  ) {}

  validateUsername(username: string) {
    if (!username || username.trim() === '') {
      throw new BadRequestException('Username is required');
    }
    if (!USERNAME_REGEX.test(username)) {
      throw new BadRequestException(
        'Username must start with a letter, be 3-30 characters long, and can only contain letters, numbers, and underscores'
      );
    }
  }

  validateDisplayName(displayName: string) {
    if (!displayName || displayName.trim() === '') {
      throw new BadRequestException('Display name is required');
    }
    if (!DISPLAY_NAME_REGEX.test(displayName)) {
      throw new BadRequestException('Display name must be between 2 and 50 characters');
    }
  }

  validateBio(bio: string) {
    if (bio && bio.length > MAX_BIO_LENGTH) {
      throw new BadRequestException(`Bio cannot exceed ${MAX_BIO_LENGTH} characters`);
    }
  }

  validateCreatorTypes(creatorTypes: string[]) {
    if (!creatorTypes || creatorTypes.length === 0) {
      throw new BadRequestException('At least one creator type is required');
    }
    for (const type of creatorTypes) {
      if (!VALID_CREATOR_TYPES.includes(type.toLowerCase())) {
        throw new BadRequestException(
          `Invalid creator type: ${type}. Valid types: ${VALID_CREATOR_TYPES.join(', ')}`
        );
      }
    }
  }

  async isUsernameTaken(username: string, excludeUserId?: number): Promise<boolean> {
    let queryText = 'SELECT id FROM users WHERE username = $1';
    const params: any[] = [username];

    if (excludeUserId) {
      queryText += ' AND id != $2';
      params.push(excludeUserId);
    }

    const result = await this.db.query(queryText, params);
    return result.rows.length > 0;
  }

  async uploadAvatar(file: Express.Multer.File): Promise<string> {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid image format. Allowed: JPG, JPEG, PNG, WEBP');
    }
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('Image size must be less than 2MB');
    }

    return this.cloudinary.uploadFile(
      file.buffer,
      'avatars',
      'image',
      [{ width: 500, height: 500, crop: 'fill' }]
    );
  }

  async getCreatorStats(creatorId: number) {
    const allTimeResult = await this.db.query(
      `SELECT COUNT(ts.id) as total
       FROM track_streams ts
       JOIN tracks t ON ts.track_id = t.id
       WHERE t.user_id = $1`,
      [creatorId]
    );
    const allTimePlays = parseInt(allTimeResult.rows[0]?.total || 0);

    const followersResult = await this.db.query(
      'SELECT COUNT(*) as total FROM follows WHERE following_id = $1',
      [creatorId]
    );
    const followers = parseInt(followersResult.rows[0]?.total || 0);

    const monthlyResult = await this.db.query(
      `SELECT COUNT(DISTINCT ts.user_id) as total
       FROM track_streams ts
       JOIN tracks t ON ts.track_id = t.id
       WHERE t.user_id = $1 AND ts.played_at >= NOW() - INTERVAL '30 days'`,
      [creatorId]
    );
    const monthlyListeners = parseInt(monthlyResult.rows[0]?.total || 0);

    return {
      all_time_plays: allTimePlays,
      followers: followers,
      monthly_listeners: monthlyListeners
    };
  }

  async createCreatorProfile(
    userId: number,
    displayName: string,
    username: string,
    bio: string,
    creatorTypes: string[],
    twitter: string | null,
    instagram: string | null,
    soundcloud: string | null,
    avatarUrl: string | null
  ) {
    this.validateDisplayName(displayName);
    this.validateUsername(username);
    this.validateBio(bio);
    if (creatorTypes) this.validateCreatorTypes(creatorTypes);

    const usernameTaken = await this.isUsernameTaken(username);
    if (usernameTaken) {
      throw new BadRequestException('Username already taken');
    }

    const result = await this.db.query(
      `UPDATE users SET 
        display_name = $1, 
        username = $2, 
        bio = $3, 
        creator_type = $4, 
        twitter = $5, 
        instagram = $6, 
        soundcloud = $7,
        avatar_url = COALESCE($8, avatar_url)
       WHERE id = $9 RETURNING id, display_name, username, bio, creator_type, twitter, instagram, soundcloud, avatar_url`,
      [displayName, username, bio, creatorTypes, twitter, instagram, soundcloud, avatarUrl, userId]
    );

    return result.rows[0];
  }

  async updateCreatorProfile(
    userId: number,
    displayName: string,
    username: string,
    bio: string,
    creatorTypes: string[],
    twitter: string | null,
    instagram: string | null,
    soundcloud: string | null,
    avatarUrl: string | undefined
  ) {
    if (displayName) this.validateDisplayName(displayName);
    if (username) this.validateUsername(username);
    if (bio) this.validateBio(bio);
    if (creatorTypes && creatorTypes.length > 0) {
      this.validateCreatorTypes(creatorTypes);
    }

    if (username) {
      const usernameTaken = await this.isUsernameTaken(username, userId);
      if (usernameTaken) {
        throw new BadRequestException('Username already taken');
      }
    }

    let queryText = `UPDATE users SET id = id`; // dummy start
    const params: any[] = [];
    let paramIndex = 1;

    if (displayName !== undefined) {
      queryText += `, display_name = $${paramIndex++}`;
      params.push(displayName);
    }
    if (username !== undefined) {
      queryText += `, username = $${paramIndex++}`;
      params.push(username);
    }
    if (bio !== undefined) {
      queryText += `, bio = $${paramIndex++}`;
      params.push(bio);
    }
    if (creatorTypes && creatorTypes.length > 0) {
      queryText += `, creator_type = $${paramIndex++}`;
      params.push(creatorTypes);
    }
    if (twitter !== undefined) {
      queryText += `, twitter = $${paramIndex++}`;
      params.push(twitter);
    }
    if (instagram !== undefined) {
      queryText += `, instagram = $${paramIndex++}`;
      params.push(instagram);
    }
    if (soundcloud !== undefined) {
      queryText += `, soundcloud = $${paramIndex++}`;
      params.push(soundcloud);
    }
    if (avatarUrl !== undefined) {
      queryText += `, avatar_url = $${paramIndex++}`;
      params.push(avatarUrl);
    }

    queryText += ` WHERE id = $${paramIndex++} RETURNING id, display_name, username, bio, creator_type, twitter, instagram, soundcloud, avatar_url`;
    params.push(userId);

    const result = await this.db.query(queryText, params);
    return result.rows[0];
  }

  async getCreatorProfileById(userId: number) {
    const result = await this.db.query(
      `SELECT id, display_name, username, bio, creator_type, twitter, instagram, soundcloud, avatar_url 
       FROM users 
       WHERE id = $1`,
      [userId]
    );
    const profile = result.rows[0];
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async createFanProfile(
    userId: number,
    displayName: string,
    username: string,
    avatarUrl: string | null
  ) {
    this.validateDisplayName(displayName);
    this.validateUsername(username);

    const usernameTaken = await this.isUsernameTaken(username);
    if (usernameTaken) {
      throw new BadRequestException('Username already taken');
    }

    const result = await this.db.query(
      `UPDATE users SET 
        display_name = $1, 
        username = $2, 
        avatar_url = COALESCE($3, avatar_url)
       WHERE id = $4 RETURNING id, display_name, username, avatar_url`,
      [displayName, username, avatarUrl, userId]
    );

    return result.rows[0];
  }

  async updateFanProfile(
    userId: number,
    displayName: string,
    username: string,
    avatarUrl: string | undefined
  ) {
    if (displayName) this.validateDisplayName(displayName);
    if (username) this.validateUsername(username);

    if (username) {
      const usernameTaken = await this.isUsernameTaken(username, userId);
      if (usernameTaken) {
        throw new BadRequestException('Username already taken');
      }
    }

    let queryText = `UPDATE users SET id = id`;
    const params: any[] = [];
    let paramIndex = 1;

    if (displayName !== undefined) {
      queryText += `, display_name = $${paramIndex++}`;
      params.push(displayName);
    }
    if (username !== undefined) {
      queryText += `, username = $${paramIndex++}`;
      params.push(username);
    }
    if (avatarUrl !== undefined) {
      queryText += `, avatar_url = $${paramIndex++}`;
      params.push(avatarUrl);
    }

    queryText += ` WHERE id = $${paramIndex++} RETURNING id, display_name, username, avatar_url`;
    params.push(userId);

    const result = await this.db.query(queryText, params);
    return result.rows[0];
  }

  async getFanProfileById(userId: number) {
    const result = await this.db.query(
      `SELECT id, display_name, username, avatar_url FROM users WHERE id = $1`,
      [userId]
    );
    const profile = result.rows[0];
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async searchUsers(query: string, limit: number = 8) {
    if (!query || !query.trim()) return [];
    const clean = query.replace(/^@/, '').trim().toLowerCase();
    const result = await this.db.query(
      `SELECT id, username, display_name, avatar_url, wallet, role 
       FROM users 
       WHERE (LOWER(REPLACE(username, '@', '')) LIKE $1 OR LOWER(display_name) LIKE $1)
       ORDER BY CASE WHEN LOWER(REPLACE(username, '@', '')) LIKE $2 THEN 0 ELSE 1 END, username ASC 
       LIMIT $3`,
      [`%${clean}%`, `${clean}%`, limit]
    );
    return result.rows;
  }

  async getPublicProfile(username: string) {
    const cleanUsername = username ? username.replace(/^@/, '').trim().toLowerCase() : '';
    const result = await this.db.query(
      `SELECT id, display_name, username, bio, creator_type, twitter, instagram, soundcloud, avatar_url, role, wallet 
       FROM users 
       WHERE LOWER(REPLACE(username, '@', '')) = $1 OR LOWER(username) = $1`,
      [cleanUsername]
    );
    const profile = result.rows[0];
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    // Fetch creator stats
    const statsRes = await this.db.query(
      `SELECT 
        (SELECT COUNT(*)::int FROM track_streams ts JOIN tracks t ON ts.track_id = t.id WHERE t.user_id = $1) as all_time_plays,
        (SELECT COUNT(*)::int FROM follows WHERE following_id = $1) as followers`,
      [profile.id]
    );

    // Fetch published tracks for this creator
    const tracksRes = await this.db.query(
      `SELECT 
        t.id,
        t.user_id,
        t.title,
        t.cover_url,
        t.audio_url,
        COALESCE(t.license_price, t.price, '5.00') as price,
        t.currency,
        t.usage_rights as license_types,
        u.display_name as creator,
        u.username as creator_username
       FROM tracks t
       JOIN users u ON t.user_id = u.id
       WHERE t.user_id = $1 AND t.visibility = 'public'
         AND EXISTS (SELECT 1 FROM songs s WHERE s.track_id = t.id AND s.status = 'published')
       ORDER BY t.created_at DESC`,
      [profile.id]
    );

    return {
      ...profile,
      stats: statsRes.rows[0] || { all_time_plays: 0, followers: 0 },
      tracks: tracksRes.rows || [],
    };
  }

  async getUserById(userId: number) {
    const result = await this.db.query(
      `SELECT id, email, wallet, role, display_name as "displayName", username, bio, creator_type as "creatorType", twitter, instagram, soundcloud, avatar_url as "avatarUrl", created_at as "createdAt" FROM users WHERE id = $1`,
      [userId]
    );
    const user = result.rows[0];
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUserRole(userId: number, role: string) {
    await this.db.query(
      'UPDATE users SET role = $1 WHERE id = $2',
      [role, userId]
    );
  }

  async updateUserWallet(userId: number, wallet: string) {
    await this.db.query(
      'UPDATE users SET wallet = $1 WHERE id = $2',
      [wallet, userId]
    );
  }
}
