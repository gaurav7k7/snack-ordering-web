import { z } from 'zod';

export const blockCustomerSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});
