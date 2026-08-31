import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  cover_url?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsEnum(['public', 'private', 'invite_only'])
  @IsOptional()
  room_type?: 'public' | 'private' | 'invite_only';

  @IsNumber()
  @IsOptional()
  max_listeners?: number;

  @IsBoolean()
  @IsOptional()
  is_recorded?: boolean;

  @IsString()
  @IsOptional()
  scheduled_for?: string;

  @IsNumber()
  @IsOptional()
  gated_nft_id?: number;

  @IsString()
  @IsOptional()
  bonus_file_url?: string;

  @IsBoolean()
  @IsOptional()
  stems_enabled?: boolean;

  @IsBoolean()
  @IsOptional()
  allow_hand_raise?: boolean;

  @IsBoolean()
  @IsOptional()
  enable_tipping?: boolean;

  @IsArray()
  @IsOptional()
  co_host_handles?: string[];
}
