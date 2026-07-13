import { z } from 'zod';

export const listSubscribersQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  range: z.enum(['7d', '30d', '6m', 'all']).optional(),
  status: z.enum(['active', 'unsubscribed']).optional(),
  sortBy: z.enum(['createdAt', 'email']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export const exportSubscribersQuerySchema = listSubscribersQuerySchema.extend({
  format: z.enum(['csv', 'xlsx', 'json']),
});
