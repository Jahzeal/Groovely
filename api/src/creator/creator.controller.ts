import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { CreatorService } from './creator.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { SuccessMessages } from '../constants';

@Controller('creator')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('creator')
export class CreatorController {
  constructor(private creatorService: CreatorService) {}

  @Get()
  @ResponseMessage(SuccessMessages.CREATOR_DATA_FETCHED)
  async getCreatorData(@Req() req: any) {
    return {
      role: 'creator',
      userId: req.userId,
      message: 'Creator dashboard is ready. Specific features will be added soon.',
    };
  }

  @Get('dashboard/stats')
  @ResponseMessage('Dashboard stats retrieved successfully')
  async getDashboardStats(@Req() req: any) {
    const userId = req.userId;
    return this.creatorService.getDashboardStats(userId);
  }

  @Get('dashboard/tracks')
  @ResponseMessage('Dashboard tracks retrieved successfully')
  async getDashboardTracks(@Req() req: any) {
    const userId = req.userId;
    const tracks = await this.creatorService.getDashboardTracks(userId);
    return { tracks };
  }
}
