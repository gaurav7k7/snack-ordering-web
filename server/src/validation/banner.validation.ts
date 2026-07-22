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
    heading: z.string().trim().max(120).optional(),
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
    if (!data.heading && !data.image) {
      ctx.addIssue({
        code: 'custom',
        path: ['heading'],
        message: 'Provide at least a banner image or a heading.',
      });
    }
  });

export const updateBannerSchema = z
  .object({
    heading: z.string().trim().max(120).optional(),
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
    // Only enforced when a save explicitly submits both fields (the admin
    // edit form always sends the full draft) — a sparse patch like toggling
    // isActive or swapping order never includes heading/image at all, so it
    // must not be blocked by this check.
    if ('heading' in data && 'image' in data && !data.heading && !data.image) {
      ctx.addIssue({
        code: 'custom',
        path: ['heading'],
        message: 'Provide at least a banner image or a heading.',
      });
    }
  });
