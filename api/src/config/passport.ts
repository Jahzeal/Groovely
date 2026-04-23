import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { googleConfig } from './env';
import { findUserByEmail, createUserWithGoogle, findUserById } from '../services/authService';

passport.use(
  new GoogleStrategy(
    {
      clientID: googleConfig.clientId!,
      clientSecret: googleConfig.clientSecret!,
      callbackURL: googleConfig.callbackUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found from Google'), undefined);
        }

        let user = await findUserByEmail(email);
        
        if (!user) {
          user = await createUserWithGoogle(email, 'fan');
        }

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await findUserById(id);
    if (!user) {
      
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;