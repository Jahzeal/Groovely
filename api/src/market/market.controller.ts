import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { MarketService } from './market.service';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@Controller('market')
export class MarketController {
  constructor(private marketService: MarketService) {}

  @Get('trending')
  @ResponseMessage('Trending tracks retrieved successfully')
  async getTrendingTracks(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit) : 10;
    const tracks = await this.marketService.getTrendingTracks(
      isNaN(parsedLimit) ? 10 : parsedLimit,
    );
    return { tracks };
  }

  @Get('for-you')
  @ResponseMessage('Recommended tracks retrieved successfully')
  async getForYouTracks(@Req() req: any, @Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit) : 10;
    const userId = req.user?.id || req.user?.userId;
    const tracks = await this.marketService.getForYouTracks(
      userId ? Number(userId) : undefined,
      isNaN(parsedLimit) ? 10 : parsedLimit,
    );
    return { tracks };
  }

  @Get('category/:category')
  @ResponseMessage('Tracks retrieved successfully')
  async getTracksByCategory(
    @Param('category') category: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit) : 20;
    const tracks = await this.marketService.getTracksByCategory(
      category,
      isNaN(parsedLimit) ? 20 : parsedLimit,
    );
    return {
      tracks,
      category,
    };
  }

  @Get('tracks/:id')
  @ResponseMessage('Track details retrieved successfully')
  async getTrackDetails(@Param('id') id: string) {
    const trackId = parseInt(id);
    if (isNaN(trackId)) {
      throw new BadRequestException('Invalid track ID');
    }
    return this.marketService.getTrackDetails(trackId);
  }
}
