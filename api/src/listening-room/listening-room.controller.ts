import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ListeningRoomService } from './listening-room.service';
import { ListeningRoomGateway } from './listening-room.gateway';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@Controller('rooms')
export class ListeningRoomController {
  constructor(
    private readonly roomService: ListeningRoomService,
    private readonly roomGateway: ListeningRoomGateway
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRoom(@Req() req: any, @Body() dto: CreateRoomDto) {
    const hostId = Number(req.userId || req.user?.id);
    if (!hostId) throw new BadRequestException('Invalid authentication token');
    const role = (req.userRole || req.user?.role || '').toLowerCase();
    if (role === 'fan') {
      throw new BadRequestException('Only verified Creators can create listening rooms');
    }
    const room = await this.roomService.createRoom(hostId, dto);

    // Broadcast room_created event to all connected clients on /rooms socket namespace (< 5ms)
    if (this.roomGateway?.server) {
      this.roomGateway.server.emit('room_created', room);
    }

    return { success: true, data: room };
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  async getActiveRooms(
    @Query('genre') genre?: string,
    @Query('search') search?: string
  ) {
    const rooms = await this.roomService.getActiveRooms(genre, search);
    return { success: true, data: rooms };
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async getRoomDetails(@Param('id', ParseIntPipe) roomId: number) {
    const details = await this.roomService.getRoomDetails(roomId);
    return { success: true, data: details };
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  async joinRoom(@Req() req: any, @Param('id', ParseIntPipe) roomId: number, @Body() body: any) {
    const userId = Number(req.userId || req.user?.id);
    const details = await this.roomService.joinRoom(roomId, userId, body.role);
    return { success: true, data: details };
  }

  @Post(':id/leave')
  @UseGuards(JwtAuthGuard)
  async leaveRoom(@Req() req: any, @Param('id', ParseIntPipe) roomId: number) {
    const userId = Number(req.userId || req.user?.id);
    const res = await this.roomService.leaveRoom(roomId, userId);
    return { success: true, data: res };
  }

  @Post(':id/playlist')
  @UseGuards(JwtAuthGuard)
  async addTrackToPlaylist(
    @Req() req: any, 
    @Param('id', ParseIntPipe) roomId: number,
    @Body('trackId', ParseIntPipe) trackId: number
  ) {
    const userId = Number(req.userId || req.user?.id);
    const details = await this.roomService.addTrackToPlaylist(roomId, userId, trackId);
    return { success: true, data: details };
  }

  @Post(':id/kick')
  @UseGuards(JwtAuthGuard)
  async kickParticipant(
    @Req() req: any,
    @Param('id', ParseIntPipe) roomId: number,
    @Body('targetUserId') targetUserIdInput: any
  ) {
    const hostId = Number(req.userId || req.user?.id);
    const targetUserId = Number(targetUserIdInput);
    const updatedDetails = await this.roomService.kickParticipant(roomId, hostId, targetUserId);

    if (this.roomGateway?.server) {
      this.roomGateway.server.to(`room:${roomId}`).emit('participant_kicked', {
        targetUserId,
        roomId,
        participants: updatedDetails.participants,
      });
    }

    return { success: true, data: updatedDetails };
  }

  @Post(':id/end')
  @UseGuards(JwtAuthGuard)
  async endRoom(@Req() req: any, @Param('id', ParseIntPipe) roomId: number) {
    const hostId = Number(req.userId || req.user?.id);
    const res = await this.roomService.endRoom(roomId, hostId);

    if (this.roomGateway?.server) {
      // 1. Broadcast to participants inside room
      this.roomGateway.server.to(`room:${roomId}`).emit('room_ended', { roomId, endedBy: hostId });

      // 2. Broadcast globally to /rooms namespace for instant directory removal
      this.roomGateway.server.emit('room_status_changed', {
        roomId: Number(roomId),
        status: 'ended',
        is_live: false,
        isLive: false,
      });
    }

    return { success: true, data: res };
  }
}

