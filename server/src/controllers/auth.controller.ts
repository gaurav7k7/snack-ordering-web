import { StatusCodes } from 'http-status-codes';

import { env } from '../config/env.js';
import { UserModel } from '../models/User.model.js';
import {
  generateOtp,
  generateToken,
  getCookieOptions,
  hashToken,
  signAccessToken,
  verifyRefreshToken,
} from '../services/auth.service.js';
import { sendEmail } from '../services/email.service.js';
import { issueRefreshSession, revokeRefreshToken, rotateRefreshSession } from '../services/refreshToken.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { escapeHtml, renderEmailHtml } from '../utils/emailTemplates.js';

const cookieOptions = getCookieOptions();

function createAuthCookies(
  res: any,
  accessToken: string,
  refreshToken: string,
  rememberMe = false,
) {
  res.cookie('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: 1000 * 60 * 15,
  });
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24 * 7,
  });
}

function clearAuthCookies(res: any) {
  res.clearCookie('accessToken', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
}

function mapUser(user: any) {
  return {
    id: user._id?.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    isEmailVerified: user.isEmailVerified,
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, rememberMe = false } = req.body;

  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw new AppError('Email is already registered.', StatusCodes.BAD_REQUEST);
  }

  const verificationToken = generateToken(24);
  const user = await UserModel.create({
    name,
    email,
    password,
    emailVerificationToken: hashToken(verificationToken),
    emailVerificationExpires: new Date(Date.now() + 1000 * 60 * 60 * 24),
  });

  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = await issueRefreshSession(user._id.toString(), user.role, rememberMe);
  createAuthCookies(res, accessToken, refreshToken, rememberMe);

  const verificationUrl = `${env.clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: 'Verify your SnackCo email',
    html: renderEmailHtml(
      'Verify your email',
      `<p>Hi ${escapeHtml(name)},</p><p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>`,
    ),
    text: `Hi ${name}, verify your email: ${verificationUrl}`,
  });

  res
    .status(StatusCodes.CREATED)
    .json(
      createApiResponse('Registration successful. Verification email sent.', {
        user: mapUser(user),
      }),
    );
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe = false } = req.body;

  const user = await UserModel.findOne({ email }).select('+password');
  if (!user || !user.password) {
    throw new AppError('Invalid email or password.', StatusCodes.UNAUTHORIZED);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', StatusCodes.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError(
      'Your account has been blocked. Contact support if you believe this is a mistake.',
      StatusCodes.FORBIDDEN,
    );
  }

  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = await issueRefreshSession(user._id.toString(), user.role, rememberMe);
  createAuthCookies(res, accessToken, refreshToken, rememberMe);

  res.status(StatusCodes.OK).json(createApiResponse('Login successful.', { user: mapUser(user) }));
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken =
    req.cookies?.refreshToken ?? req.headers.authorization?.replace('Bearer ', '');
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  clearAuthCookies(res);
  res.status(StatusCodes.OK).json(createApiResponse('Logged out successfully.'));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken =
    req.cookies.refreshToken ?? req.headers.authorization?.replace('Bearer ', '');
  if (!refreshToken) {
    throw new AppError('Refresh token is required.', StatusCodes.UNAUTHORIZED);
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    clearAuthCookies(res);
    throw new AppError('Invalid or expired session. Please log in again.', StatusCodes.UNAUTHORIZED);
  }

  const user = await UserModel.findById(payload.userId);
  if (!user) {
    throw new AppError('Account not found.', StatusCodes.UNAUTHORIZED);
  }
  if (!user.isActive) {
    clearAuthCookies(res);
    throw new AppError('Your account has been blocked.', StatusCodes.FORBIDDEN);
  }

  const rotation = await rotateRefreshSession(
    refreshToken,
    payload.userId,
    payload.role,
    payload.family,
    payload.rememberMe,
  );

  if ('reused' in rotation) {
    clearAuthCookies(res);
    throw new AppError(
      'This session was already used elsewhere. Please log in again for your security.',
      StatusCodes.UNAUTHORIZED,
    );
  }

  const accessToken = signAccessToken({ userId: payload.userId, role: payload.role });
  createAuthCookies(res, accessToken, rotation.token, payload.rememberMe);

  res.status(StatusCodes.OK).json(createApiResponse('Token refreshed successfully.'));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('User not found.', StatusCodes.UNAUTHORIZED);
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found.', StatusCodes.NOT_FOUND);
  }

  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Current user retrieved.', { user: mapUser(user) }));
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, token } = req.body;
  const user = await UserModel.findOne({ email }).select(
    '+emailVerificationToken +emailVerificationExpires',
  );
  if (!user || !user.emailVerificationToken || !user.emailVerificationExpires) {
    throw new AppError('Invalid verification request.', StatusCodes.BAD_REQUEST);
  }

  const hashedToken = hashToken(token);
  if (hashedToken !== user.emailVerificationToken || user.emailVerificationExpires < new Date()) {
    throw new AppError('Verification token is invalid or expired.', StatusCodes.BAD_REQUEST);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  res.status(StatusCodes.OK).json(createApiResponse('Email verified successfully.'));
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError('Email not found.', StatusCodes.NOT_FOUND);
  }

  const verificationToken = generateToken(24);
  user.emailVerificationToken = hashToken(verificationToken);
  user.emailVerificationExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);
  await user.save();

  const verificationUrl = `${env.clientUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: 'Verify your SnackCo email',
    html: renderEmailHtml(
      'Verify your email',
      `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>`,
    ),
    text: `Verify your email: ${verificationUrl}`,
  });

  res.status(StatusCodes.OK).json(createApiResponse('Verification email resent.'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw new AppError('Email not found.', StatusCodes.NOT_FOUND);
  }

  const resetToken = generateToken(24);
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 60);
  await user.save();

  const resetUrl = `${env.clientUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
  await sendEmail({
    to: email,
    subject: 'Reset your SnackCo password',
    html: renderEmailHtml(
      'Reset your password',
      `<p>Reset your password by visiting <a href="${resetUrl}">this link</a>. This link expires in 1 hour.</p>`,
    ),
    text: `Reset your password: ${resetUrl}`,
  });

  res.status(StatusCodes.OK).json(createApiResponse('Password reset instructions sent.'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, token, password, rememberMe = false } = req.body;
  const user = await UserModel.findOne({ email }).select(
    '+passwordResetToken +passwordResetExpires +password',
  );
  if (!user || !user.passwordResetToken || !user.passwordResetExpires) {
    throw new AppError('Invalid password reset request.', StatusCodes.BAD_REQUEST);
  }

  const hashedToken = hashToken(token);
  if (hashedToken !== user.passwordResetToken || user.passwordResetExpires < new Date()) {
    throw new AppError('Password reset token is invalid or expired.', StatusCodes.BAD_REQUEST);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = await issueRefreshSession(user._id.toString(), user.role, rememberMe);
  createAuthCookies(res, accessToken, refreshToken, rememberMe);

  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Password reset successfully.', { user: mapUser(user) }));
});

export const requestOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  let user = await UserModel.findOne({ email });
  if (!user) {
    user = await UserModel.create({
      name: email.split('@')[0],
      email,
      isEmailVerified: true,
    });
  }

  const otp = generateOtp();
  user.otpCode = otp;
  user.otpExpires = new Date(Date.now() + 1000 * 60 * 10);
  await user.save();

  await sendEmail({
    to: email,
    subject: 'Your SnackCo login code',
    html: renderEmailHtml(
      'Your login code',
      `<p>Your one-time login code is:</p><p style="font-size:28px;font-weight:800;letter-spacing:0.1em;">${otp}</p><p>This code expires in 10 minutes.</p>`,
    ),
    text: `Your one-time login code is ${otp}`,
  });

  res.status(StatusCodes.OK).json(createApiResponse('OTP sent to your email.'));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, rememberMe = false } = req.body;
  const user = await UserModel.findOne({ email }).select('+otpCode +otpExpires');
  if (!user || !user.otpCode || !user.otpExpires) {
    throw new AppError('Invalid OTP request.', StatusCodes.BAD_REQUEST);
  }

  if (user.otpCode !== otp || user.otpExpires < new Date()) {
    throw new AppError('OTP is invalid or expired.', StatusCodes.BAD_REQUEST);
  }

  if (!user.isActive) {
    throw new AppError(
      'Your account has been blocked. Contact support if you believe this is a mistake.',
      StatusCodes.FORBIDDEN,
    );
  }

  user.otpCode = undefined;
  user.otpExpires = undefined;
  await user.save();

  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = await issueRefreshSession(user._id.toString(), user.role, rememberMe);
  createAuthCookies(res, accessToken, refreshToken, rememberMe);

  res
    .status(StatusCodes.OK)
    .json(createApiResponse('OTP verified successfully.', { user: mapUser(user) }));
});

export const googleAuthCallback = asyncHandler(async (req, res) => {
  const user = req.user as any;
  if (!user) {
    throw new AppError('Google authentication failed.', StatusCodes.UNAUTHORIZED);
  }

  if (!user.isActive) {
    res.redirect(`${env.clientUrl}/login?error=account-blocked`);
    return;
  }

  const accessToken = signAccessToken({ userId: user._id.toString(), role: user.role });
  const refreshToken = await issueRefreshSession(user._id.toString(), user.role);
  createAuthCookies(res, accessToken, refreshToken);
  res.redirect(`${env.clientUrl}/?auth=google-success`);
});
