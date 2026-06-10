import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('creator')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('plays')
  @ResponseMessage('Plays analytics retrieved successfully')
  async getPlaysAnalytics(@Req() req: any) {
    const userId = req.userId;
    return this.analyticsService.getMonthlyData(userId, 'plays');
  }

  @Get('earnings')
  @ResponseMessage('Earnings analytics retrieved successfully')
  async getEarningsAnalytics(@Req() req: any) {
    const userId = req.userId;
    return this.analyticsService.getMonthlyData(userId, 'earnings');
  }

  @Get('listeners')
  @ResponseMessage('Listeners analytics retrieved successfully')
  async getListenersAnalytics(@Req() req: any) {
    const userId = req.userId;
    return this.analyticsService.getMonthlyData(userId, 'listeners');
  }

  @Get('top-tracks')
  @ResponseMessage('Top tracks retrieved successfully')
  async getTopTracks(@Req() req: any) {
    const userId = req.userId;
    return this.analyticsService.getTopTracks(userId);
  }
}
