import jwt, { type SignOptions } from 'jsonwebtoken';

import { env } from '../config/env.js';
import type { UserRole } from '../constants/roles.js';

type TokenPayload = {
  userId: string;
  role: UserRole;
};

export function signAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  } satisfies SignOptions);
}

export function signRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  } satisfies SignOptions);
}
