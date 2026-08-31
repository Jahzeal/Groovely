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

  handleConnection(client: Socket) {
    console.log(`📡 Client connected to Listening Rooms gateway: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`📡 Client disconnected from Listening Rooms gateway: ${client.id}`);
  }

  private activeRoomPlaybackState = new Map<number, any>();

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { roomId: number; userId: number; role?: string }
  ) {
    const { roomId, userId, role } = payload;
    const roomChannel = `room:${roomId}`;
    client.join(roomChannel);

    const updatedDetails = await this.roomService.joinRoom(roomId, userId, role);

    // Broadcast user joined event to room
    this.server.to(roomChannel).emit('user_joined', {
      userId,
      roomId,
      participants: updatedDetails.participants,
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

    const updatedDetails = await this.roomService.leaveRoom(roomId, userId);
    client.leave(roomChannel);

    this.server.to(roomChannel).emit('user_left', { 
      userId, 
      roomId, 
      participants: updatedDetails.participants 
    });
    return { event: 'room_left', roomId };
  }

  @SubscribeMessage('playback_control')
  async handlePlaybackControl(
    @MessageBody() payload: { roomId: number; userId: number; action: 'play' | 'pause' | 'seek'; trackId?: number; track?: any; positionMs?: number }
  ) {
    const { roomId, userId, action, trackId, track, positionMs = 0 } = payload;
    let syncData: any;
    try {
      syncData = await this.roomService.updatePlayback(roomId, userId, action, trackId, positionMs);
    } catch (e) {
      syncData = { roomId, action, state: action === 'play' ? 'playing' : 'paused', current_track_id: trackId, positionMs, timestamp: Date.now() };
    }
    if (track) {
      syncData.track = track;
    }

    // Store active playback state in gateway memory for newly joining fans
    this.activeRoomPlaybackState.set(Number(roomId), syncData);

    // Broadcast playback sync to ALL listeners in room
    this.server.to(`room:${roomId}`).emit('playback_synced', syncData);
    return syncData;
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
}
