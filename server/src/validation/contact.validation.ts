import { z } from 'zod';

import { PHONE_INVALID_MESSAGE, PHONE_REGEX } from '../utils/validationPatterns.js';

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  phone: z.string().trim().regex(PHONE_REGEX, PHONE_INVALID_MESSAGE).optional().or(z.literal('')),
  subject: z.string().trim().min(3).max(150).optional().or(z.literal('')),
  message: z.string().trim().min(10).max(2000),
});
