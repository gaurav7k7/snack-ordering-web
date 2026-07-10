import passport from 'passport';
import { Router } from 'express';

import {
  forgotPassword,
  getCurrentUser,
  googleAuthCallback,
  login,
  logout,
  refreshAccessToken,
  register,
  requestOtp,
  resendVerificationEmail,
  resetPassword,
  verifyEmail,
  verifyOtp,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  loginLimiter,
  otpRequestLimiter,
  otpVerifyLimiter,
  passwordResetLimiter,
  registerLimiter,
} from '../middleware/rateLimiters.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  requestOtpSchema,
  resetPasswordSchema,
  resendVerificationSchema,
  verifyEmailSchema,
  verifyOtpSchema,
} from '../validation/auth.validation.js';

export const authRoutes = Router();

authRoutes.post('/register', registerLimiter, validateRequest({ body: registerSchema }), register);
authRoutes.post('/login', loginLimiter, validateRequest({ body: loginSchema }), login);
authRoutes.post('/logout', logout);
authRoutes.post('/refresh', refreshAccessToken);
authRoutes.get('/me', authenticate, getCurrentUser);
authRoutes.post('/verify-email', validateRequest({ body: verifyEmailSchema }), verifyEmail);
authRoutes.post(
  '/resend-verification',
  validateRequest({ body: resendVerificationSchema }),
  resendVerificationEmail,
);
authRoutes.post(
  '/forgot-password',
  passwordResetLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  forgotPassword,
);
authRoutes.post('/reset-password', validateRequest({ body: resetPasswordSchema }), resetPassword);
authRoutes.post('/otp/request', otpRequestLimiter, validateRequest({ body: requestOtpSchema }), requestOtp);
authRoutes.post('/otp/verify', otpVerifyLimiter, validateRequest({ body: verifyOtpSchema }), verifyOtp);
authRoutes.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
);
authRoutes.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL ?? 'http://localhost:5173'}/login?error=google`,
  }),
  googleAuthCallback,
);
