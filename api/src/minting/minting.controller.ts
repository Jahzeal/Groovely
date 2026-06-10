import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { MintingService, CreateSongDto, CreateEditionDto, ContributorDto, ConfirmMintDto } from './minting.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ResponseMessage } from '../common/decorators/response-message.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class MintingController {
  constructor(private mintingService: MintingService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Songs
  // ─────────────────────────────────────────────────────────────────────────

  @Post('songs')
  @ResponseMessage('Song created successfully')
  async createSong(@Req() req: any, @Body() body: CreateSongDto) {
    if (!body.title?.trim()) {
      throw new BadRequestException('Title is required');
    }
    return this.mintingService.createSong(req.userId, body);
  }

  @Get('songs')
  @ResponseMessage('Songs retrieved successfully')
  async getMySongs(@Req() req: any) {
    const songs = await this.mintingService.getMySongs(req.userId);
    return { songs };
  }

  @Get('songs/:id')
  @ResponseMessage('Song retrieved successfully')
  async getSong(@Param('id') id: string) {
    const songId = parseInt(id);
    if (isNaN(songId)) throw new BadRequestException('Invalid song ID');
    return this.mintingService.getSong(songId);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Contributors
  // ─────────────────────────────────────────────────────────────────────────

  @Post('songs/:id/contributors')
  @ResponseMessage('Contributors saved successfully')
  async setContributors(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { contributors: ContributorDto[] },
  ) {
    const songId = parseInt(id);
    if (isNaN(songId)) throw new BadRequestException('Invalid song ID');
    if (!body.contributors || !Array.isArray(body.contributors)) {
      throw new BadRequestException('contributors array is required');
    }
    const contributors = await this.mintingService.setContributors(
      songId,
      req.userId,
      body.contributors,
    );
    return { contributors };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Editions
  // ─────────────────────────────────────────────────────────────────────────

  @Post('songs/:id/editions')
  @ResponseMessage('Edition created successfully')
  async createEdition(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: CreateEditionDto,
  ) {
    const songId = parseInt(id);
    if (isNaN(songId)) throw new BadRequestException('Invalid song ID');
    if (!body.edition_type) throw new BadRequestException('edition_type is required');
    if (body.mint_price_usdc === undefined || body.mint_price_usdc < 0) {
      throw new BadRequestException('mint_price_usdc is required');
    }
    return this.mintingService.createEdition(songId, req.userId, body);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Confirm on-chain mint (called by frontend after successful blockchain tx)
  // ─────────────────────────────────────────────────────────────────────────

  @Post('mint/confirm')
  @ResponseMessage('Mint confirmed successfully')
  async confirmMint(@Req() req: any, @Body() body: ConfirmMintDto) {
    if (!body.edition_id || !body.tx_hash || !body.buyer_wallet) {
      throw new BadRequestException('edition_id, tx_hash, and buyer_wallet are required');
    }
    // Inject authenticated user ID
    body.buyer_user_id = req.userId;
    return this.mintingService.confirmMint(body);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Purchase status (for 40s preview limit check)
  // ─────────────────────────────────────────────────────────────────────────

  @Get('tracks/:id/purchased')
  @ResponseMessage('Purchase status retrieved')
  async isPurchased(@Req() req: any, @Param('id') id: string) {
    const trackId = parseInt(id);
    if (isNaN(trackId)) throw new BadRequestException('Invalid track ID');
    const purchased = await this.mintingService.isPurchased(req.userId, trackId);
    return { purchased, trackId };
  }

  @Get('my/purchases')
  @ResponseMessage('Purchases retrieved successfully')
  async getMyPurchases(@Req() req: any) {
    const purchases = await this.mintingService.getUserPurchases(req.userId);
    return { purchases };
  }
}
