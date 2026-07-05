import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Enter your name.'),
    email: z.string().email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    confirmPassword: z.string().min(8, 'Confirm your password.'),
    rememberMe: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match.',
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  token: z.string().min(1, 'Reset token is required.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterFormInput = z.infer<typeof registerSchema>;
export type ForgotPasswordFormInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormInput = z.infer<typeof resetPasswordSchema>;
