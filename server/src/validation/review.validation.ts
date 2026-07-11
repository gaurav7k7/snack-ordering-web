import { z } from 'zod';

const reviewImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
});

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(1).max(120),
  comment: z.string().trim().min(1).max(2000),
  images: z.array(reviewImageSchema).max(4, 'You can attach up to 4 images.').optional(),
});

export const updateReviewSchema = createReviewSchema.partial();

export const reportReviewSchema = z.object({
  reason: z.string().trim().min(3, 'Please provide a reason for reporting this review.').max(300),
});

export const moderateReviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export const listReviewsQuerySchema = z.object({
  sort: z.enum(['recent', 'helpful']).optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).optional(),
});
