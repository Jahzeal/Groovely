import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found from Google'), undefined);
      }

      const targetRole = req.session?.googleRole || 'creator';

      let user = await this.authService.findUserByEmail(email);
      let isNewUser = false;
      
      if (!user) {
        user = await this.authService.createUserWithGoogle(email, targetRole);
        isNewUser = true;
      } else if (req.session?.googleRole && user.role !== req.session.googleRole) {
        user = await this.authService.updateUserRole(user.id, req.session.googleRole);
      }

      return done(null, { ...user, isNewUser });
    } catch (error) {
      return done(error, undefined);
    }
  }
}
