import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ListeningRoomService } from './listening-room.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'rooms',
})
export class ListeningRoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomService: ListeningRoomService) {}

  private socketToUserMap = new Map<string, { roomId: number; userId: number }>();
  private activeRoomPlaybackState = new Map<number, any>();
  private activeRoomMuteState = new Map<string, boolean>();

  handleConnection(client: Socket) {
    console.log(`📡 Client connected to Listening Rooms gateway: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`📡 Client disconnected from Listening Rooms gateway: ${client.id}`);
    const userSession = this.socketToUserMap.get(client.id);
    if (userSession) {
      this.socketToUserMap.delete(client.id);
      const { roomId, userId } = userSession;
      try {
        const updatedDetails = await this.roomService.leaveRoom(roomId, userId);
        const roomChannel = `room:${roomId}`;
        this.server.to(roomChannel).emit('user_left', {
          userId,
          roomId,
          participants: updatedDetails.participants,
        });
      } catch (err) {
        console.warn(`Disconnection cleanup for user ${userId} in room ${roomId} failed:`, err);
      }
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: number; userId: number; role?: string }
  ) {
    const { roomId, userId, role } = payload;
    const roomChannel = `room:${roomId}`;
    client.join(roomChannel);

    // Map socket ID to user session for auto-cleanup on disconnect
    this.socketToUserMap.set(client.id, { roomId: Number(roomId), userId: Number(userId) });

    const updatedDetails = await this.roomService.joinRoom(roomId, userId, role);

    const enrichedParticipants = updatedDetails.participants.map((p: any) => {
      const isMuted = this.activeRoomMuteState.get(`${roomId}:${p.user_id}`) ?? true;
      return { ...p, is_muted: isMuted, isMuted };
    });

    // Broadcast user joined event to room
    this.server.to(roomChannel).emit('user_joined', {
      userId,
      roomId,
      participants: enrichedParticipants,
    });

    // Send active playing track & playback state directly to newly joining fan
    const activePlayback = this.activeRoomPlaybackState.get(Number(roomId));
    if (activePlayback) {
      client.emit('playback_synced', activePlayback);
    }

    return { event: 'room_joined', data: updatedDetails };
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: number; userId: number }
  ) {
    const { roomId, userId } = payload;
    const roomChannel = `room:${roomId}`;

    this.socketToUserMap.delete(client.id);
    const updatedDetails = await this.roomService.leaveRoom(roomId, userId);
    client.leave(roomChannel);

    this.server.to(roomChannel).emit('user_left', { 
      userId, 
      roomId, 
      participants: updatedDetails.participants 
    });
    return { event: 'room_left', roomId };
  }

  // WebRTC Low-Latency Voice Signaling Handlers (< 50ms voice streaming)
  @SubscribeMessage('webrtc_offer')
  handleWebRTCOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: number; senderId: number; sdp: any }
  ) {
    client.to(`room:${payload.roomId}`).emit('webrtc_offer', payload);
  }

  @SubscribeMessage('webrtc_answer')
  handleWebRTCAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: number; senderId: number; sdp: any }
  ) {
    client.to(`room:${payload.roomId}`).emit('webrtc_answer', payload);
  }

  @SubscribeMessage('webrtc_ice_candidate')
  handleWebRTCIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: number; senderId: number; candidate: any }
  ) {
    client.to(`room:${payload.roomId}`).emit('webrtc_ice_candidate', payload);
  }

  @SubscribeMessage('playback_control')
  async handlePlaybackControl(
    @MessageBody() payload: { roomId: number; userId: number; action: 'play' | 'pause' | 'seek'; trackId?: number; track?: any; positionMs?: number }
  ) {
    const { roomId, userId, action, trackId, track, positionMs = 0 } = payload;
    const state = action === 'play' ? 'playing' : 'paused';
    const timestamp = Date.now();

    const syncData: any = {
      roomId: Number(roomId),
      action,
      state,
      current_track_id: trackId,
      positionMs,
      timestamp,
      track: track || null,
    };

    // 1. Store active playback state in memory for joining fans
    this.activeRoomPlaybackState.set(Number(roomId), syncData);

    // 2. Broadcast playback sync IMMEDIATELY to all listeners in room over WebSockets (< 5ms latency)
    this.server.to(`room:${roomId}`).emit('playback_synced', syncData);

    // 3. Persist to PostgreSQL database asynchronously in the background
    this.roomService.updatePlayback(roomId, userId, action, trackId, positionMs).catch((e) => {
      console.warn('Background room playback DB update notice:', e);
    });

    return syncData;
  }

  @SubscribeMessage('toggle_mute')
  async handleToggleMute(
    @MessageBody() payload: { roomId: number; userId: number; isMuted: boolean }
  ) {
    const { roomId, userId, isMuted } = payload;
    this.activeRoomMuteState.set(`${roomId}:${userId}`, isMuted);
    this.server.to(`room:${roomId}`).emit('participant_mute_updated', { userId, isMuted });
    return { event: 'mute_toggled', userId, isMuted };
  }

  @SubscribeMessage('voice_stream')
  handleVoiceStream(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: number; userId: number; audioData: string }
  ) {
    const { roomId, userId, audioData } = payload;
    client.to(`room:${roomId}`).emit('voice_stream_received', { userId, audioData });
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() payload: { roomId: number; userId: number; content: string; messageType?: string; metadata?: any }
  ) {
    const { roomId, userId, content, messageType = 'text', metadata = {} } = payload;
    const msg = await this.roomService.addMessage(roomId, userId, content, messageType, metadata);

    // Broadcast message to room
    this.server.to(`room:${roomId}`).emit('new_message', msg);
    return msg;
  }

  @SubscribeMessage('raise_hand')
  async handleRaiseHand(
    @MessageBody() payload: { roomId: number; userId: number }
  ) {
    const { roomId, userId } = payload;
    const res = await this.roomService.toggleHandRaise(roomId, userId);

    this.server.to(`room:${roomId}`).emit('hand_raised_toggled', { userId, isHandRaised: res.is_hand_raised });
    return res;
  }

  @SubscribeMessage('set_participant_role')
  async handleSetRole(
    @MessageBody() payload: { roomId: number; hostId: number; targetUserId: number; newRole: 'cohost' | 'speaker' | 'listener' }
  ) {
    const { roomId, hostId, targetUserId, newRole } = payload;
    const res = await this.roomService.setParticipantRole(roomId, hostId, targetUserId, newRole);

    this.server.to(`room:${roomId}`).emit('participant_role_updated', res);
    return res;
  }

  @SubscribeMessage('end_room')
  async handleEndRoom(
    @MessageBody() payload: { roomId: number; hostId: number }
  ) {
    const { roomId, hostId } = payload;
    const res = await this.roomService.endRoom(roomId, hostId);

    // Broadcast room_ended event to all participants in room
    this.server.to(`room:${roomId}`).emit('room_ended', { roomId, endedBy: hostId });
    return res;
  }

  @SubscribeMessage('kick_participant')
  async handleKickParticipant(
    @MessageBody() payload: { roomId: number; hostId: number; targetUserId: number }
  ) {
    const { roomId, hostId, targetUserId } = payload;
    const updatedDetails = await this.roomService.kickParticipant(roomId, hostId, targetUserId);

    this.server.to(`room:${roomId}`).emit('participant_kicked', {
      targetUserId,
      roomId,
      participants: updatedDetails.participants,
    });

    return { event: 'participant_kicked', targetUserId, roomId };
  }
}
