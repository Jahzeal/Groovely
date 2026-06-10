import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  Req,
  BadRequestException,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { TrackService } from './track.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@Controller()
export class TrackController {
  constructor(private trackService: TrackService) {}

  // ==========================================
  // Creator Tracks Management
  // ==========================================

  @Post('creator/tracks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'audio', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  @ResponseMessage('Track uploaded successfully')
  async uploadTrack(
    @Req() req: any,
    @Body() body: any,
    @UploadedFiles()
    files: { audio?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ) {
    const userId = req.userId;
    const {
      title,
      description,
      visibility,
      explicit,
      category,
      tags,
      bpm,
      key,
      isrc,
      usageRights,
      payment_model,
      paymentModel,
      license_price,
      licensePrice,
      royalty_percentage,
      royaltyPercentage,
    } = body;

    if (!title) {
      throw new BadRequestException('Title is required');
    }
    if (!category) {
      throw new BadRequestException('Category is required');
    }

    const audioFile = files?.audio?.[0];
    const coverFile = files?.cover?.[0];

    if (!audioFile) {
      throw new BadRequestException('Audio file is required');
    }
    if (!coverFile) {
      throw new BadRequestException('Cover art image is required');
    }

    // Parse structures
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try { parsedTags = JSON.parse(tags); } catch { parsedTags = null; }
    }

    let parsedUsageRights = usageRights;
    if (typeof usageRights === 'string') {
      try { parsedUsageRights = JSON.parse(usageRights); } catch { parsedUsageRights = []; }
    }

    const parsedBpm = bpm ? parseInt(bpm) : null;
    const parsedKey = key || null;
    const parsedIsrc = isrc || null;
    const isExplicit = explicit === 'true' || explicit === true;

    const model = paymentModel || payment_model || 'fixed';
    const price = parseFloat(licensePrice || license_price || '0.00');
    const royalty = parseInt(royaltyPercentage || royalty_percentage || '10');

    return this.trackService.createNewTrack(
      userId,
      title,
      description || null,
      audioFile,
      coverFile,
      visibility || 'public',
      isExplicit,
      category,
      parsedTags,
      parsedBpm,
      parsedKey,
      parsedIsrc,
      parsedUsageRights,
      model,
      isNaN(price) ? 0.00 : price,
      isNaN(royalty) ? 10 : royalty,
    );
  }

  @Get('creator/tracks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @ResponseMessage('Tracks retrieved successfully')
  async getMyTracks(@Req() req: any) {
    const userId = req.userId;
    const tracks = await this.trackService.getCreatorTracks(userId);
    return { tracks };
  }

  @Get('creator/tracks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @ResponseMessage('Track retrieved successfully')
  async getTrack(@Req() req: any, @Param('id') id: string) {
    const userId = req.userId;
    const trackId = parseInt(id);
    if (isNaN(trackId)) {
      throw new BadRequestException('Invalid track ID');
    }
    return this.trackService.getTrackDetails(trackId, userId);
  }

  @Patch('creator/tracks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @ResponseMessage('Track updated successfully')
  async updateTrack(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const userId = req.userId;
    const trackId = parseInt(id);
    if (isNaN(trackId)) {
      throw new BadRequestException('Invalid track ID');
    }
    return this.trackService.updateTrackDetails(trackId, userId, body);
  }

  @Delete('creator/tracks/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @ResponseMessage('Track deleted successfully')
  async deleteTrack(@Req() req: any, @Param('id') id: string) {
    const userId = req.userId;
    const trackId = parseInt(id);
    if (isNaN(trackId)) {
      throw new BadRequestException('Invalid track ID');
    }
    await this.trackService.removeTrack(trackId, userId);
    return null;
  }

  // ==========================================
  // Track Streaming Endpoints
  // ==========================================

  @Post('tracks/:id/stream')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Stream recorded successfully')
  async recordStream(@Req() req: any, @Param('id') id: string) {
    const userId = req.userId;
    const trackId = parseInt(id);
    if (isNaN(trackId)) {
      throw new BadRequestException('Invalid track ID');
    }
    const earnings = 0.0001;
    const stream = await this.trackService.recordStream(trackId, userId, earnings);
    return {
      stream_id: stream.id,
      earnings,
    };
  }

  // ==========================================
  // Library (Saved/Purchased/Played)
  // ==========================================

  @Get('library')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Library retrieved successfully')
  async getLibrary(
    @Req() req: any,
    @Query('filter') filter?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.userId;
    const activeFilter = filter || 'all';
    const parsedLimit = limit ? parseInt(limit) : 50;

    const tracks = await this.trackService.getLibrary(
      userId,
      activeFilter,
      isNaN(parsedLimit) ? 50 : parsedLimit,
    );

    return {
      tracks,
      filter: activeFilter,
    };
  }

  @Post('library/save/:id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Track saved to library')
  async saveTrack(@Req() req: any, @Param('id') id: string) {
    const userId = req.userId;
    const trackId = parseInt(id);
    if (isNaN(trackId)) {
      throw new BadRequestException('Invalid track ID');
    }
    return this.trackService.saveTrack(userId, trackId);
  }

  @Delete('library/save/:id')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Track removed from library')
  async removeSavedTrack(@Req() req: any, @Param('id') id: string) {
    const userId = req.userId;
    const trackId = parseInt(id);
    if (isNaN(trackId)) {
      throw new BadRequestException('Invalid track ID');
    }
    return this.trackService.removeSavedTrack(userId, trackId);
  }
}
