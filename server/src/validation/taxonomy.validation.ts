import { z } from 'zod';

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
  alt: z.string().optional(),
});

const logoSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
});

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
  image: imageSchema.optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(500).optional(),
  image: imageSchema.optional(),
  isActive: z.boolean().optional(),
});

export const createSubCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id.'),
  description: z.string().trim().max(500).optional(),
});

export const updateSubCategorySchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean().optional(),
});

export const createBrandSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
  logo: logoSchema.optional(),
});

export const updateBrandSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(500).optional(),
  logo: logoSchema.optional(),
  isActive: z.boolean().optional(),
});

export const createTagSchema = z.object({
  name: z.string().trim().min(2).max(40),
});

export const updateTagSchema = z.object({
  name: z.string().trim().min(2).max(40).optional(),
  isActive: z.boolean().optional(),
});
