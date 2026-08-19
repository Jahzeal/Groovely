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
    });
  }

  async validate(
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

      let user = await this.authService.findUserByEmail(email);
      let isNewUser = false;
      
      if (!user) {
        user = await this.authService.createUserWithGoogle(email, 'fan');
        isNewUser = true;
      }

      return done(null, { ...user, isNewUser });
    } catch (error) {
      return done(error, undefined);
    }
  }
}
