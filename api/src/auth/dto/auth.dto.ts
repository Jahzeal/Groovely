import { IsNotEmpty, IsString, IsEmail, Matches, IsEnum, IsOptional } from 'class-validator';

export class WalletSignupDto {
  @IsNotEmpty({ message: 'Wallet address is required to sign up.' })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'The wallet address you provided is not valid.' })
  walletAddress: string;

  @IsNotEmpty({ message: 'Please select either Creator or Fan as your role.' })
  @IsEnum(['creator', 'fan'], { message: 'Please select either Creator or Fan as your role.' })
  role: 'creator' | 'fan';

  @IsString()
  @IsOptional()
  signature?: string;
}

export class GoogleSignupDto {
  @IsNotEmpty({ message: 'Email address is required to sign up with Google.' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;

  @IsNotEmpty({ message: 'Please select either Creator or Fan as your role.' })
  @IsEnum(['creator', 'fan'], { message: 'Please select either Creator or Fan as your role.' })
  role: 'creator' | 'fan';
}

export class WalletLoginDto {
  @IsNotEmpty({ message: 'Wallet address is required to sign up.' })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'The wallet address you provided is not valid.' })
  walletAddress: string;

  @IsString()
  @IsOptional()
  signature?: string;
}

export class GoogleLoginDto {
  @IsNotEmpty({ message: 'Email address is required to sign up with Google.' })
  @IsEmail({}, { message: 'Please provide a valid email address.' })
  email: string;
}

