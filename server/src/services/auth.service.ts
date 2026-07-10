import crypto from 'crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';

import { env } from '../config/env.js';
import type { UserRole } from '../constants/roles.js';

type TokenPayload = {
  userId: string;
  role: UserRole;
  rememberMe?: boolean;
};

type RefreshTokenPayload = TokenPayload & {
  family: string;
};

export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

export function generateOtp() {
  return String(100000 + Math.floor(Math.random() * 900000));
}

export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as StringValue,
  } satisfies SignOptions);
}

export function signRefreshToken(payload: RefreshTokenPayload, rememberMe = false) {
  const expiresIn = rememberMe ? env.jwtRefreshRememberMeExpiresIn : env.jwtRefreshExpiresIn;

  return jwt.sign({ ...payload, rememberMe }, env.jwtRefreshSecret, {
    expiresIn: expiresIn as StringValue,
  } satisfies SignOptions);
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, env.jwtRefreshSecret) as RefreshTokenPayload;
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? ('none' as const) : ('lax' as const),
    path: '/',
  };
}
