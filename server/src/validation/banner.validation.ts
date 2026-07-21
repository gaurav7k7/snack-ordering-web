import { z } from 'zod';

// publicId is optional (unlike other entity image schemas) because seed/legacy
// banner images may point at non-Cloudinary URLs with no publicId to store.
const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().optional(),
});

export const createBannerSchema = z
  .object({
    heading: z.string().trim().min(2).max(120),
    subheading: z.string().trim().max(80).optional(),
    description: z.string().trim().max(300).optional(),
    buttonText: z.string().trim().max(40).optional(),
    buttonLink: z.string().trim().max(300).optional(),
    image: imageSchema.optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.buttonText && !data.buttonLink) {
      ctx.addIssue({ code: 'custom', path: ['buttonLink'], message: 'Button link is required when button text is set.' });
    }
    if (data.buttonLink && !data.buttonText) {
      ctx.addIssue({ code: 'custom', path: ['buttonText'], message: 'Button text is required when button link is set.' });
    }
  });

export const updateBannerSchema = z
  .object({
    heading: z.string().trim().min(2).max(120).optional(),
    subheading: z.string().trim().max(80).optional(),
    description: z.string().trim().max(300).optional(),
    buttonText: z.string().trim().max(40).optional(),
    buttonLink: z.string().trim().max(300).optional(),
    image: imageSchema.nullable().optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.buttonText && data.buttonLink === '') {
      ctx.addIssue({ code: 'custom', path: ['buttonLink'], message: 'Button link is required when button text is set.' });
    }
  });
