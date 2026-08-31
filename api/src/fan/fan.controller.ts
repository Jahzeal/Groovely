import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FanService } from './fan.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { SuccessMessages } from '../constants';

@Controller('fan')
export class FanController {
  constructor(private fanService: FanService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fan')
  @ResponseMessage(SuccessMessages.FAN_DATA_FETCHED)
  async getFanData(@Req() req: any) {
    return {
      role: 'fan',
      userId: req.userId,
      message: 'Fan dashboard is ready. Specific features will be added soon.',
    };
  }

  @Get('trending')
  @ResponseMessage('Trending tracks retrieved successfully')
  async getTrendingTracks(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit) : 10;
    const tracks = await this.fanService.getTrendingTracks(
      isNaN(parsedLimit) ? 10 : parsedLimit,
    );
    return { tracks };
  }

  @Get('recent')
  @ResponseMessage('Recent tracks retrieved successfully')
  async getRecentTracks(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit) : 10;
    const tracks = await this.fanService.getRecentTracks(
      isNaN(parsedLimit) ? 10 : parsedLimit,
    );
    return { tracks };
  }

  @Get('creators')
  @UseGuards(OptionalJwtAuthGuard)
  @ResponseMessage('Creators retrieved successfully')
  async getCreators(
    @Req() req: any,
    @Query('q') search?: string,
    @Query('limit') limit?: string,
  ) {
    const userId = req.userId || 0;
    const parsedLimit = limit ? parseInt(limit) : 50;
    const creators = await this.fanService.getCreators(
      userId,
      isNaN(parsedLimit) ? 50 : parsedLimit,
      search,
    );
    return { creators };
  }

  @Post('creators/:id/follow')
  @ResponseMessage('Creator followed successfully')
  async followCreator(@Req() req: any, @Param('id') id: string) {
    const followerId = req.userId;
    const followingId = parseInt(id);
    if (isNaN(followingId)) {
      throw new BadRequestException('Invalid creator ID');
    }
    return this.fanService.followCreator(followerId, followingId);
  }

  @Delete('creators/:id/follow')
  @ResponseMessage('Creator unfollowed successfully')
  async unfollowCreator(@Req() req: any, @Param('id') id: string) {
    const followerId = req.userId;
    const followingId = parseInt(id);
    if (isNaN(followingId)) {
      throw new BadRequestException('Invalid creator ID');
    }
    return this.fanService.unfollowCreator(followerId, followingId);
  }

  @Get('recommendations')
  @ResponseMessage('Recommendations retrieved successfully')
  async getRecommendations(@Req() req: any, @Query('limit') limit?: string) {
    const userId = req.userId;
    const parsedLimit = limit ? parseInt(limit) : 10;
    const recommendations = await this.fanService.getRecommendations(
      userId,
      isNaN(parsedLimit) ? 10 : parsedLimit,
    );
    return { recommendations };
  }
}
