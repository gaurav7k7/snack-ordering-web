import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import { env } from './env.js';
import { UserModel } from '../models/User.model.js';

if (env.googleClientId && env.googleClientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleClientId,
        clientSecret: env.googleClientSecret,
        callbackURL: env.googleCallbackUrl ?? 'http://localhost:5000/api/v1/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Google account did not provide email.'), undefined);
          }

          const existingUser = await UserModel.findOne({ email });
          if (existingUser) {
            if (!existingUser.googleId) {
              existingUser.googleId = profile.id;
              existingUser.isEmailVerified = true;
              await existingUser.save();
            }
            return done(null, existingUser);
          }

          const newUser = await UserModel.create({
            name: profile.displayName ?? email.split('@')[0],
            email,
            googleId: profile.id,
            isEmailVerified: true,
          });

          return done(null, newUser);
        } catch (error) {
          return done(error as Error);
        }
      },
    ),
  );
}
