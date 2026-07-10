import rateLimit from 'express-rate-limit';

const TOO_MANY_REQUESTS_MESSAGE = {
  success: false,
  message: 'Too many requests. Please wait a while before trying again.',
};

// Login: only failed attempts count against the limit, so a burst of
// legitimate successful logins (e.g. shared office IP) never gets throttled.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: TOO_MANY_REQUESTS_MESSAGE,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: TOO_MANY_REQUESTS_MESSAGE,
});

// OTP request also sends an email — this limit is as much about not letting
// an attacker use us as a spam relay as it is about brute-force protection.
export const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: TOO_MANY_REQUESTS_MESSAGE,
});

// OTP verify: a 6-digit code is brute-forceable in ~1M attempts, so this
// window has to be tight regardless of the code's own 10-minute expiry.
export const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: TOO_MANY_REQUESTS_MESSAGE,
});

export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: TOO_MANY_REQUESTS_MESSAGE,
});
