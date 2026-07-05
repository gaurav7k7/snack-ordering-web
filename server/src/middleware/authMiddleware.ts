import jwt from 'jsonwebtoken';
import type { RequestHandler } from 'express';

import { env } from '../config/env.js';
import type { UserRole } from '../constants/roles.js';
import { AppError } from '../utils/AppError.js';

type AccessTokenPayload = {
  userId: string;
  role: UserRole;
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: AccessTokenPayload;
  }
}

export const authenticate: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.accessToken ?? req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    next(new AppError('Authentication required.', 401));
    return;
  }

  try {
    req.user = jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;
    next();
  } catch {
    next(new AppError('Invalid or expired token.', 401));
  }
};

export function authorize(...roles: UserRole[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new AppError('You do not have permission to access this resource.', 403));
      return;
    }

    next();
  };
}
