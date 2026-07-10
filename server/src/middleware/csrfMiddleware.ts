import crypto from 'crypto';
import type { CookieOptions, RequestHandler } from 'express';

import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const CSRF_COOKIE = 'csrfToken';
const CSRF_HEADER = 'x-csrf-token';
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function csrfCookieOptions(): CookieOptions {
  return {
    // Must be readable by client-side JS so it can be echoed back as a header
    // (double-submit-cookie pattern) — this token is not a secret on its own,
    // it only proves the request originated from same-origin JS, not a
    // cross-site form/img/fetch that can't read cookies it didn't set.
    httpOnly: false,
    secure: env.nodeEnv === 'production',
    sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
    path: '/',
  };
}

export const csrfProtection: RequestHandler = (req, res, next) => {
  let cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined;

  if (!cookieToken) {
    cookieToken = crypto.randomBytes(24).toString('hex');
    res.cookie(CSRF_COOKIE, cookieToken, csrfCookieOptions());
  }

  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const headerToken = req.headers[CSRF_HEADER];
  if (typeof headerToken !== 'string' || headerToken !== cookieToken) {
    next(new AppError('Invalid or missing CSRF token.', 403));
    return;
  }

  next();
};
