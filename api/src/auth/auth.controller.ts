import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  Res,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  WalletSignupDto,
  GoogleSignupDto,
  WalletLoginDto,
  GoogleLoginDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GoogleAuthGuard } from './google.guard';
import { ResponseMessage } from '../common/decorators/response-message.decorator';
import { SuccessMessages, ErrorMessages } from '../constants';
import { generateToken } from '../utils/jwt';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('nonce/:walletAddress')
  getNonce(@Param('walletAddress') walletAddress: string) {
    const nonce = Math.floor(Math.random() * 1000000).toString();
    const message = `Welcome to Grooveli!\n\nSign this message to log in or register.\n\nWallet address: ${walletAddress}\nNonce: ${nonce}`;
    return {
      success: true,
      nonce,
      message,
    };
  }

  @Post('signup/wallet')
  @ResponseMessage('Account created successfully')
  async walletSignup(@Body() body: WalletSignupDto) {
    const { walletAddress, role } = body;
    const existingUser = await this.authService.findUserByWallet(walletAddress);
    if (existingUser) {
      throw new ConflictException(
        'An account with this wallet already exists. Please login instead.',
      );
    }
    const result = await this.authService.walletAuth(walletAddress, role);
    return {
      success: true,
      token: result.token,
      userId: String(result.user.id),
      isNewUser: result.isNewUser,
      user: result.user,
      data: {
        token: result.token,
        user: result.user,
      },
    };
  }

  @Post('signup/google')
  @ResponseMessage('Account created successfully')
  async googleSignup(@Body() body: GoogleSignupDto) {
    const { email, role } = body;
    const existingUser = await this.authService.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        'An account with this email already exists. Please login instead.',
      );
    }
    const result = await this.authService.googleAuth(email, role);
    return {
      success: true,
      token: result.token,
      userId: String(result.user.id),
      isNewUser: result.isNewUser,
      user: result.user,
      data: {
        token: result.token,
        user: result.user,
      },
    };
  }

  @Post('login/wallet')
  @ResponseMessage(SuccessMessages.USER_LOGGED_IN)
  async walletLogin(@Body() body: WalletLoginDto) {
    const { walletAddress } = body;
    const existingUser = await this.authService.findUserByWallet(walletAddress);
    if (!existingUser) {
      throw new UnauthorizedException(
        'No account found with this wallet. Please sign up first.',
      );
    }
    const result = await this.authService.walletAuth(walletAddress, existingUser.role);
    return {
      success: true,
      token: result.token,
      userId: String(result.user.id),
      isNewUser: result.isNewUser,
      user: result.user,
      data: {
        token: result.token,
        user: result.user,
      },
    };
  }

  @Post('login/google')
  @ResponseMessage(SuccessMessages.USER_LOGGED_IN)
  async googleLogin(@Body() body: GoogleLoginDto) {
    const { email } = body;
    const existingUser = await this.authService.findUserByEmail(email);
    if (!existingUser) {
      throw new UnauthorizedException(
        'No account found with this email. Please sign up first.',
      );
    }
    const result = await this.authService.googleAuth(email, existingUser.role);
    return {
      success: true,
      token: result.token,
      userId: String(result.user.id),
      isNewUser: result.isNewUser,
      user: result.user,
      data: {
        token: result.token,
        user: result.user,
      },
    };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {
    // Initiates Google OAuth redirect flow, handled by GoogleAuthGuard
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleAuthCallback(@Req() req: any, @Res() res: any) {
    try {
      const user = req.user;
      const role = req.session?.googleRole || 'fan';

      const token = generateToken(user.id, role, user.wallet, user.email);
      const isNewUser = user.isNewUser === true;

      const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const frontendUrl = rawClientUrl.split(',')[0].trim();
      res.redirect(
        `${frontendUrl}/auth/callback?status=AUTHENTICATED&token=${token}&userId=${user.id}&isNewUser=${isNewUser}`,
      );
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const rawClientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const frontendUrl = rawClientUrl.split(',')[0].trim();
      res.redirect(
        `${frontendUrl}/auth?error=google_auth_failed`,
      );
    }
  }

  @Get('google/failure')
  async googleFailure() {
    throw new UnauthorizedException('Google authentication failed');
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ResponseMessage(SuccessMessages.USER_RETRIEVED)
  async getMe(@Req() req: any) {
    const userId = req.userId;
    const user = await this.authService.findUserById(userId);

    if (!user) {
      throw new UnauthorizedException(ErrorMessages.USER_NOT_FOUND);
    }

    return {
      id: user.id,
      wallet: user.wallet,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt || user.created_at,
    };
  }
}

