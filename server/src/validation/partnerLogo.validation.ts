import { z } from 'zod';

import { PARTNER_LOGO_CATEGORIES } from '../models/PartnerLogo.model.js';

const categoryEnum = z.enum(PARTNER_LOGO_CATEGORIES);

const logoSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
});

export const createPartnerLogoSchema = z.object({
  name: z.string().trim().min(1).max(120),
  logo: logoSchema,
  link: z.string().trim().max(300).optional(),
  category: categoryEnum,
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const updatePartnerLogoSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  logo: logoSchema.optional(),
  link: z.string().trim().max(300).optional(),
  category: categoryEnum.optional(),
  order: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
