import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ListeningRoomService } from './listening-room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@Controller('rooms')
export class ListeningRoomController {
  constructor(private readonly roomService: ListeningRoomService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createRoom(@Req() req: any, @Body() dto: CreateRoomDto) {
    const hostId = Number(req.userId || req.user?.id);
    if (!hostId) throw new BadRequestException('Invalid authentication token');
    const room = await this.roomService.createRoom(hostId, dto);
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

  @Post(':id/end')
  @UseGuards(JwtAuthGuard)
  async endRoom(@Req() req: any, @Param('id', ParseIntPipe) roomId: number) {
    const hostId = Number(req.userId || req.user?.id);
    const res = await this.roomService.endRoom(roomId, hostId);
    return { success: true, data: res };
  }
}
