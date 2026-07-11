import { z } from 'zod';

const couponObjectSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .transform((value) => value.toUpperCase()),
  description: z.string().trim().max(200).optional(),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.coerce.number().positive(),
  maxDiscountAmount: z.coerce.number().positive().optional(),
  minOrderValue: z.coerce.number().min(0).optional(),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  usageLimit: z.coerce.number().int().min(0).optional(),
  perUserLimit: z.coerce.number().int().min(0).optional(),
  isAutomatic: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

function couponCrossFieldRefine(
  data: Partial<z.infer<typeof couponObjectSchema>>,
  ctx: z.RefinementCtx,
) {
  if (data.discountType === 'percentage' && data.discountValue !== undefined && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['discountValue'],
      message: 'Percentage discounts cannot exceed 100.',
    });
  }

  if (data.validFrom && data.validUntil && data.validFrom.getTime() >= data.validUntil.getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['validUntil'],
      message: 'validUntil must be after validFrom.',
    });
  }
}

export const createCouponSchema = couponObjectSchema.superRefine(couponCrossFieldRefine);
export const updateCouponSchema = couponObjectSchema.partial().superRefine(couponCrossFieldRefine);

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1),
  subtotal: z.coerce.number().min(0),
  guestEmail: z.string().trim().email().optional(),
});
