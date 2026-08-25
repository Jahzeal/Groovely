import {
  Controller,
  Get,
  Post,
  Patch,
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

  @Get('songs/track/:trackId')
  @ResponseMessage('Song details retrieved by track ID')
  async getSongByTrack(
    @Req() req: any,
    @Param('trackId') trackIdStr: string
  ) {
    const trackId = parseInt(trackIdStr);
    if (isNaN(trackId)) throw new BadRequestException('Invalid track ID');
    return this.mintingService.getSongByTrack(trackId, req.userId);
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

  @Get('creator/invitations')
  @ResponseMessage('Pending invitations retrieved successfully')
  async getPendingInvitations(@Req() req: any) {
    return this.mintingService.getPendingInvitations(req.userId);
  }

  @Post('creator/invitations/:id/respond')
  @ResponseMessage('Invitation status updated successfully')
  async respondToInvitation(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: { accept: boolean },
  ) {
    const contributorId = parseInt(id);
    if (isNaN(contributorId)) throw new BadRequestException('Invalid invitation ID');
    if (body.accept === undefined) throw new BadRequestException('accept (boolean) is required');
    
    return this.mintingService.respondToInvitation(
      req.userId,
      contributorId,
      body.accept,
    );
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
  // Sync smart contract IDs
  // ─────────────────────────────────────────────────────────────────────────

  @Patch('songs/:id/contract-id')
  @ResponseMessage('Song contract ID updated successfully')
  async updateSongContractId(
    @Param('id') id: string,
    @Body('contract_song_id') contractSongId: number,
  ) {
    const songId = parseInt(id);
    if (isNaN(songId)) throw new BadRequestException('Invalid song ID');
    if (contractSongId === undefined) throw new BadRequestException('contract_song_id is required');
    await this.mintingService.updateSongContractId(songId, contractSongId);
    return { success: true };
  }

  @Patch('editions/:id/contract-id')
  @ResponseMessage('Edition contract ID updated successfully')
  async updateEditionContractId(
    @Param('id') id: string,
    @Body('contract_edition_id') contractEditionId: number,
    @Body('tx_hash') txHash: string,
  ) {
    const editionId = parseInt(id);
    if (isNaN(editionId)) throw new BadRequestException('Invalid edition ID');
    if (contractEditionId === undefined) throw new BadRequestException('contract_edition_id is required');
    if (!txHash) throw new BadRequestException('tx_hash is required');
    await this.mintingService.updateEditionContractId(editionId, contractEditionId, txHash);
    return { success: true };
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
