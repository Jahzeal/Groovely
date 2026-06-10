import {
  Controller,
  Post,
  Get,
  Patch,
  Put,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { generateToken } from '../utils/jwt';

@Controller()
export class ProfileController {
  constructor(private profileService: ProfileService) {}


  // ==========================================
  // Creator Profiles
  // ==========================================

  @Post('creator/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @UseInterceptors(FileInterceptor('avatar'))
  @ResponseMessage('Creator profile created successfully')
  async createCreatorProfile(
    @Req() req: any,
    @Body() body: any,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const userId = req.userId;
    const { displayName, username, bio, creatorTypes, twitter, instagram, soundcloud } = body;

    if (!displayName || !username) {
      throw new BadRequestException('Display name and username are required');
    }

    let avatarUrl: string | null = null;
    if (avatar) {
      avatarUrl = await this.profileService.uploadAvatar(avatar);
    }

    // Parse incoming stringified arrays from client multipart forms
    let parsedCreatorTypes = creatorTypes;
    if (typeof creatorTypes === 'string') {
      try {
        parsedCreatorTypes = JSON.parse(creatorTypes);
      } catch {
        parsedCreatorTypes = creatorTypes.split(',').map((t: string) => t.trim());
      }
    }

    return this.profileService.createCreatorProfile(
      userId,
      displayName,
      username,
      bio || '',
      parsedCreatorTypes || [],
      twitter || null,
      instagram || null,
      soundcloud || null,
      avatarUrl,
    );
  }

  @Get('creator/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @ResponseMessage('Creator profile retrieved successfully')
  async getCreatorProfile(@Req() req: any) {
    const userId = req.userId;
    const profile = await this.profileService.getCreatorProfileById(userId);
    const stats = await this.profileService.getCreatorStats(userId);

    return {
      ...profile,
      stats,
    };
  }

  @Patch('creator/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('creator')
  @UseInterceptors(FileInterceptor('avatar'))
  @ResponseMessage('Creator profile updated successfully')
  async updateCreatorProfile(
    @Req() req: any,
    @Body() body: any,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const userId = req.userId;
    const { displayName, username, bio, creatorTypes, twitter, instagram, soundcloud } = body;

    let avatarUrl: string | undefined = undefined;
    if (avatar) {
      avatarUrl = await this.profileService.uploadAvatar(avatar);
    }

    let parsedCreatorTypes = creatorTypes;
    if (typeof creatorTypes === 'string') {
      try {
        parsedCreatorTypes = JSON.parse(creatorTypes);
      } catch {
        parsedCreatorTypes = creatorTypes.split(',').map((t: string) => t.trim());
      }
    }

    return this.profileService.updateCreatorProfile(
      userId,
      displayName,
      username,
      bio,
      parsedCreatorTypes,
      twitter,
      instagram,
      soundcloud,
      avatarUrl,
    );
  }

  // ==========================================
  // Fan Profiles
  // ==========================================

  @Post('fan/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fan')
  @UseInterceptors(FileInterceptor('avatar'))
  @ResponseMessage('Fan profile created successfully')
  async createFanProfile(
    @Req() req: any,
    @Body() body: any,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const userId = req.userId;
    const { displayName, username } = body;

    if (!displayName || !username) {
      throw new BadRequestException('Display name and username are required');
    }

    let avatarUrl: string | null = null;
    if (avatar) {
      avatarUrl = await this.profileService.uploadAvatar(avatar);
    }

    return this.profileService.createFanProfile(userId, displayName, username, avatarUrl);
  }

  @Get('fan/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fan')
  @ResponseMessage('Fan profile retrieved successfully')
  async getFanProfile(@Req() req: any) {
    const userId = req.userId;
    return this.profileService.getFanProfileById(userId);
  }

  @Patch('fan/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('fan')
  @UseInterceptors(FileInterceptor('avatar'))
  @ResponseMessage('Fan profile updated successfully')
  async updateFanProfile(
    @Req() req: any,
    @Body() body: any,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    const userId = req.userId;
    const { displayName, username } = body;

    let avatarUrl: string | undefined = undefined;
    if (avatar) {
      avatarUrl = await this.profileService.uploadAvatar(avatar);
    }

    return this.profileService.updateFanProfile(userId, displayName, username, avatarUrl);
  }

  // ==========================================
  // User Self Profile Update (Compatibility for onboarding)
  // ==========================================

  @Put('users/me')
  @Patch('users/me')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage('Profile updated successfully')
  async updateMe(
    @Req() req: any,
    @Body() body: any,
  ) {
    const userId = req.userId;
    let role = req.userRole;
    const wallet = req.userWallet;
    const email = req.userEmail;
    
    const { displayName, username, bio, creatorType, role: bodyRole } = body;

    let roleChanged = false;
    if (bodyRole === 'creator' && role !== 'creator') {
      await this.profileService.updateUserRole(userId, 'creator');
      role = 'creator';
      roleChanged = true;
    } else if (bodyRole === 'fan' && role !== 'fan') {
      await this.profileService.updateUserRole(userId, 'fan');
      role = 'fan';
      roleChanged = true;
    }

    let profileResult;
    if (role === 'creator') {
      const creatorTypes = creatorType ? [creatorType] : [];
      profileResult = await this.profileService.updateCreatorProfile(
        userId,
        displayName,
        username,
        bio || '',
        creatorTypes,
        undefined, // twitter
        undefined, // instagram
        undefined, // soundcloud
        undefined, // avatarUrl
      );
    } else {
      profileResult = await this.profileService.updateFanProfile(
        userId,
        displayName,
        username,
        undefined, // avatarUrl
      );
    }

    if (roleChanged) {
      const newToken = generateToken(userId, role, wallet, email);
      return {
        ...profileResult,
        token: newToken,
        role,
      };
    }

    return profileResult;
  }

  // ==========================================
  // Public Profiles
  // ==========================================

  @Get('profile/:username')
  @ResponseMessage('Profile retrieved successfully')
  async getPublicProfile(@Param('username') username: string) {
    const profile = await this.profileService.getPublicProfile(username);

    if (profile.role === 'creator') {
      const stats = await this.profileService.getCreatorStats(profile.id);
      return {
        ...profile,
        stats,
      };
    }

    return profile;
  }
}
