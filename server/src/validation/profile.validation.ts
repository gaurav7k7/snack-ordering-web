import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number.')
    .optional()
    .or(z.literal('')),
  avatar: z.string().trim().url('Avatar must be a valid URL.').optional().or(z.literal('')),
});

export const updateAddressesSchema = z.object({
  addresses: z
    .array(z.string().trim().min(5, 'Address is too short.').max(300))
    .max(10, 'You can save up to 10 addresses.'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8).max(128),
});

export const uploadAvatarSchema = z
  .object({
    avatar: z.string().trim().url('Avatar must be a valid URL.').optional(),
    image: z.string().trim().url('Avatar must be a valid URL.').optional(),
  })
  .refine((data) => Boolean(data.avatar || data.image), {
    message: 'Avatar is required.',
    path: ['avatar'],
  });
