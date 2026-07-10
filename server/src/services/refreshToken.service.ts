import { randomUUID } from 'crypto';

import type { UserRole } from '../constants/roles.js';
import { RefreshTokenModel } from '../models/RefreshToken.model.js';
import { hashToken, signRefreshToken } from './auth.service.js';

function expiryDate(rememberMe: boolean) {
  const days = rememberMe ? 30 : 7;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

// Issues a fresh refresh token and records its hash in the store. `family`
// stays constant across every rotation of a single login session so reuse
// of a stale token can be traced back to (and used to kill) that session.
export async function issueRefreshSession(
  userId: string,
  role: UserRole,
  rememberMe = false,
  family: string = randomUUID(),
) {
  const token = signRefreshToken({ userId, role, family }, rememberMe);

  await RefreshTokenModel.create({
    user: userId,
    tokenHash: hashToken(token),
    family,
    expiresAt: expiryDate(rememberMe),
  });

  return token;
}

type RotationResult = { token: string } | { reused: true };

// Rotation with reuse detection: a refresh token can only be redeemed once.
// If it's presented again (stolen-and-replayed, or a race from a duplicate
// tab), every other token in the same family is revoked immediately so the
// whole session is killed rather than silently trusting the second use.
export async function rotateRefreshSession(
  presentedToken: string,
  userId: string,
  role: UserRole,
  family: string,
  rememberMe = false,
): Promise<RotationResult> {
  const presentedHash = hashToken(presentedToken);
  const record = await RefreshTokenModel.findOne({ tokenHash: presentedHash });

  if (!record || record.revokedAt) {
    await RefreshTokenModel.updateMany({ family, revokedAt: null }, { revokedAt: new Date() });
    return { reused: true };
  }

  record.revokedAt = new Date();
  await record.save();

  const token = await issueRefreshSession(userId, role, rememberMe, family);
  return { token };
}

export async function revokeRefreshToken(token: string) {
  await RefreshTokenModel.updateOne({ tokenHash: hashToken(token) }, { revokedAt: new Date() });
}

export async function revokeAllUserSessions(userId: string) {
  await RefreshTokenModel.updateMany({ user: userId, revokedAt: null }, { revokedAt: new Date() });
}
