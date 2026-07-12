const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const EMAIL_VERIFICATION_EXPIRY_MS = DAY_MS;
export const PASSWORD_RESET_EXPIRY_MS = HOUR_MS;
export const OTP_EXPIRY_MS = 10 * MINUTE_MS;

// These intentionally mirror JWT_ACCESS_EXPIRES_IN ('15m') /
// JWT_REFRESH_EXPIRES_IN ('7d') / JWT_REFRESH_REMEMBER_ME_EXPIRES_IN ('30d')
// in config/env.ts — cookie maxAge can't be derived from those signing
// strings without an extra dependency, so keep both in sync by hand if the
// token lifetimes ever change.
export const ACCESS_TOKEN_COOKIE_MAX_AGE_MS = 15 * MINUTE_MS;
export const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 7 * DAY_MS;
export const REFRESH_TOKEN_REMEMBER_ME_COOKIE_MAX_AGE_MS = 30 * DAY_MS;
