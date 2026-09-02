import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class ListeningRoomService {
  constructor(private db: DatabaseService) {}

  async createRoom(hostId: number, dto: CreateRoomDto) {
    const { 
      title, 
      description, 
      cover_url, 
      genre, 
      room_type = 'public', 
      max_listeners = 500,
      is_recorded = false,
      scheduled_for,
      gated_nft_id,
      bonus_file_url,
      stems_enabled = false,
      allow_hand_raise = true,
      enable_tipping = true,
      co_host_handles = []
    } = dto;

    const initialStatus = scheduled_for ? 'scheduled' : 'live';

    // Create room
    const roomRes = await this.db.query(
      `INSERT INTO listening_rooms 
       (host_id, title, description, cover_url, genre, room_type, status, max_listeners,
        is_recorded, scheduled_for, gated_nft_id, bonus_file_url, stems_enabled, allow_hand_raise, enable_tipping, co_host_handles) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
       RETURNING *`,
      [
        hostId, 
        title, 
        description || '', 
        cover_url || '', 
        genre || 'All', 
        room_type, 
        initialStatus, 
        max_listeners,
        is_recorded,
        scheduled_for || null,
        gated_nft_id || null,
        bonus_file_url || null,
        stems_enabled,
        allow_hand_raise,
        enable_tipping,
        co_host_handles
      ]
    );

    const room = roomRes.rows[0];

    // Add host as participant with 'host' role
    await this.db.query(
      `INSERT INTO listening_room_participants (room_id, user_id, role, is_muted) 
       VALUES ($1, $2, 'host', false) 
       ON CONFLICT (room_id, user_id) 
       DO UPDATE SET role = 'host', left_at = NULL, is_muted = false`,
      [room.id, hostId]
    );

    return room;
  }

  async getActiveRooms(genre?: string, search?: string) {
    let query = `
      SELECT r.*, 
             u.display_name as host_name, 
             u.username as host_username, 
             u.avatar_url as host_avatar, 
             u.wallet as host_wallet,
             (SELECT COUNT(*) FROM listening_room_participants p WHERE p.room_id = r.id AND p.left_at IS NULL AND p.role = 'listener') as active_listeners,
             t.title as current_track_title,
             t.cover_url as current_track_cover,
             t.audio_url as current_track_audio
      FROM listening_rooms r
      JOIN users u ON r.host_id = u.id
      LEFT JOIN tracks t ON r.current_track_id = t.id
      WHERE r.status = 'live'
    `;

    const params: any[] = [];

    if (genre && genre !== 'All') {
      params.push(genre);
      query += ` AND LOWER(r.genre) = LOWER($${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (LOWER(r.title) LIKE LOWER($${params.length}) OR LOWER(u.display_name) LIKE LOWER($${params.length}))`;
    }

    query += ` ORDER BY r.created_at DESC`;

    const res = await this.db.query(query, params);
    return res.rows;
  }

  async getRoomDetails(roomId: number) {
    const roomRes = await this.db.query(
      `SELECT r.*, 
              COALESCE(u.display_name, 'Creator Host') as host_name, 
              COALESCE(u.username, 'host') as host_username, 
              COALESCE(u.avatar_url, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80') as host_avatar, 
              u.wallet as host_wallet,
              t.title as current_track_title,
              t.cover_url as current_track_cover,
              t.audio_url as current_track_audio
       FROM listening_rooms r
       LEFT JOIN users u ON r.host_id = u.id
       LEFT JOIN tracks t ON r.current_track_id = t.id
       WHERE r.id = $1`,
      [roomId]
    );

    if (roomRes.rows.length === 0) {
      throw new NotFoundException('Listening room not found');
    }

    const room = roomRes.rows[0];

    // Fetch active participants safely
    let participants: any[] = [];
    try {
      const participantsRes = await this.db.query(
        `SELECT p.*, 
                COALESCE(u.display_name, 'Participant') as display_name, 
                COALESCE(u.username, 'user') as username, 
                u.avatar_url, 
                u.wallet, 
                u.role as user_role
         FROM listening_room_participants p
         LEFT JOIN users u ON p.user_id = u.id
         WHERE p.room_id = $1 AND p.left_at IS NULL
         ORDER BY CASE p.role 
           WHEN 'host' THEN 1 
           WHEN 'cohost' THEN 2 
           WHEN 'speaker' THEN 3 
           ELSE 4 
         END ASC`,
        [roomId]
      );
      participants = participantsRes.rows;
    } catch (pErr) {
      console.warn('Could not fetch participants:', pErr);
    }

    // Fetch room playlist queue safely
    let playlist: any[] = [];
    try {
      const playlistRes = await this.db.query(
        `SELECT q.*, 
                t.title, 
                t.cover_url, 
                t.audio_url, 
                t.price,
                COALESCE(u.display_name, 'Creator') as added_by_name
         FROM listening_room_playlist q
         LEFT JOIN tracks t ON q.track_id = t.id
         LEFT JOIN users u ON q.added_by_user_id = u.id
         WHERE q.room_id = $1
         ORDER BY q.position_order ASC`,
        [roomId]
      );
      playlist = playlistRes.rows;
    } catch (plErr) {
      console.warn('Could not fetch room playlist:', plErr);
    }

    // Fetch recent messages safely
    let messages: any[] = [];
    try {
      const messagesRes = await this.db.query(
        `SELECT m.*, 
                COALESCE(u.display_name, 'User') as display_name, 
                COALESCE(u.username, 'user') as username, 
                u.avatar_url,
                u.wallet
         FROM listening_room_messages m
         LEFT JOIN users u ON m.user_id = u.id
         WHERE m.room_id = $1
         ORDER BY m.created_at DESC
         LIMIT 50`,
        [roomId]
      );
      messages = messagesRes.rows.reverse();
    } catch (mErr) {
      console.warn('Could not fetch room messages:', mErr);
    }

    return {
      room,
      participants,
      playlist,
      messages,
    };
  }

  async joinRoom(roomId: number, userId: number, role?: string) {
    const roomRes = await this.db.query('SELECT * FROM listening_rooms WHERE id = $1', [roomId]);
    if (roomRes.rows.length === 0) throw new NotFoundException('Room not found');

    const room = roomRes.rows[0];
    const isHost = Number(room.host_id) === Number(userId);
    let initialRole = 'listener';
    if (isHost) {
      initialRole = 'host';
    } else if (role === 'cohost' || role === 'speaker') {
      initialRole = role;
    }

    await this.db.query(
      `INSERT INTO listening_room_participants (room_id, user_id, role, left_at) 
       VALUES ($1, $2, $3, NULL) 
       ON CONFLICT (room_id, user_id) 
       DO UPDATE SET left_at = NULL, role = $3`,
      [roomId, userId, initialRole]
    );

    return this.getRoomDetails(roomId);
  }

  async leaveRoom(roomId: number, userId: number) {
    await this.db.query(
      `UPDATE listening_room_participants 
       SET left_at = CURRENT_TIMESTAMP 
       WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId]
    );
    return this.getRoomDetails(roomId);
  }

  async updatePlayback(roomId: number, userId: number, action: 'play' | 'pause' | 'seek', trackId?: number, positionMs: number = 0) {
    const roomRes = await this.db.query('SELECT * FROM listening_rooms WHERE id = $1', [roomId]);
    if (roomRes.rows.length === 0) throw new NotFoundException('Room not found');

    const room = roomRes.rows[0];

    // Check permissions (must be host or cohost)
    const partRes = await this.db.query(
      'SELECT role FROM listening_room_participants WHERE room_id = $1 AND user_id = $2 AND left_at IS NULL',
      [roomId, userId]
    );
    const userRole = partRes.rows[0]?.role;

    if (Number(room.host_id) !== Number(userId) && userRole !== 'host' && userRole !== 'cohost') {
      throw new ForbiddenException('Only host and co-hosts can control playback');
    }

    const state = action === 'play' ? 'playing' : 'paused';
    const activeTrackId = trackId || room.current_track_id;

    try {
      await this.db.query(
        `UPDATE listening_rooms 
         SET playback_state = $1, 
             current_track_id = $2, 
             playback_position_ms = $3, 
             playback_started_at = CURRENT_TIMESTAMP 
         WHERE id = $4`,
        [state, activeTrackId, positionMs, roomId]
      );
    } catch (err) {
      await this.db.query(
        `UPDATE listening_rooms 
         SET playback_state = $1, 
             playback_position_ms = $2, 
             playback_started_at = CURRENT_TIMESTAMP 
         WHERE id = $3`,
        [state, positionMs, roomId]
      );
    }

    return { roomId, action, state, current_track_id: activeTrackId, positionMs, timestamp: Date.now() };
  }

  async addTrackToPlaylist(roomId: number, userId: number, trackId: number) {
    const maxOrderRes = await this.db.query(
      'SELECT COALESCE(MAX(position_order), 0) + 1 as next_order FROM listening_room_playlist WHERE room_id = $1',
      [roomId]
    );
    const nextOrder = maxOrderRes.rows[0].next_order;

    await this.db.query(
      `INSERT INTO listening_room_playlist (room_id, track_id, added_by_user_id, position_order) 
       VALUES ($1, $2, $3, $4)`,
      [roomId, trackId, userId, nextOrder]
    );

    return this.getRoomDetails(roomId);
  }

  async addMessage(roomId: number, userId: number, content: string, messageType: string = 'text', metadata: any = {}) {
    const res = await this.db.query(
      `INSERT INTO listening_room_messages (room_id, user_id, content, message_type, metadata) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [roomId, userId, content, messageType, JSON.stringify(metadata)]
    );
    const msg = res.rows[0];

    const userRes = await this.db.query('SELECT display_name, username, avatar_url, wallet FROM users WHERE id = $1', [userId]);
    return { ...msg, ...userRes.rows[0] };
  }

  async toggleHandRaise(roomId: number, userId: number) {
    const res = await this.db.query(
      `UPDATE listening_room_participants 
       SET is_hand_raised = NOT is_hand_raised 
       WHERE room_id = $1 AND user_id = $2 
       RETURNING is_hand_raised`,
      [roomId, userId]
    );
    return res.rows[0];
  }

  async setParticipantRole(roomId: number, hostId: number, targetUserId: number, newRole: 'cohost' | 'speaker' | 'listener') {
    const roomRes = await this.db.query('SELECT host_id FROM listening_rooms WHERE id = $1', [roomId]);
    if (Number(roomRes.rows[0]?.host_id) !== Number(hostId)) {
      throw new ForbiddenException('Only the room host can promote or demote participants');
    }

    await this.db.query(
      `UPDATE listening_room_participants 
       SET role = $1 
       WHERE room_id = $2 AND user_id = $3`,
      [newRole, roomId, targetUserId]
    );

    return { success: true, targetUserId, newRole };
  }

  async kickParticipant(roomId: number, hostId: number, targetUserId: number) {
    const roomRes = await this.db.query('SELECT host_id FROM listening_rooms WHERE id = $1', [roomId]);
    if (Number(roomRes.rows[0]?.host_id) !== Number(hostId)) {
      throw new ForbiddenException('Only the room host can kick participants');
    }

    if (Number(hostId) === Number(targetUserId)) {
      throw new BadRequestException('Host cannot kick themselves');
    }

    await this.db.query(
      `UPDATE listening_room_participants 
       SET left_at = CURRENT_TIMESTAMP 
       WHERE room_id = $1 AND user_id = $2`,
      [roomId, targetUserId]
    );

    return this.getRoomDetails(roomId);
  }

  async endRoom(roomId: number, hostId: number) {
    await this.db.query(
      `UPDATE listening_rooms SET status = 'ended', ended_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [roomId]
    );

    return { success: true, roomId };
  }
}
