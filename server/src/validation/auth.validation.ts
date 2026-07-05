import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().optional(),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
});

export const resendVerificationSchema = z.object({
  email: z.string().email(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  token: z.string().min(1),
  password: z.string().min(8).max(128),
  rememberMe: z.boolean().optional(),
});

export const requestOtpSchema = z.object({
  email: z.string().email(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  rememberMe: z.boolean().optional(),
});
