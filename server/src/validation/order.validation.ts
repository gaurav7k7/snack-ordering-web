import { z } from 'zod';

import { ORDER_STATUS } from '../constants/orderStatus.js';
import {
  PHONE_INVALID_MESSAGE,
  PHONE_REGEX,
  POSTAL_CODE_INVALID_MESSAGE,
  POSTAL_CODE_REGEX,
} from '../utils/validationPatterns.js';

const orderStatusValues = Object.values(ORDER_STATUS) as [string, ...string[]];

const orderItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product id.'),
  name: z.string().trim().min(1),
  image: z.string().optional(),
  price: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(1),
});

const shippingAddressSchema = z.object({
  fullName: z.string().trim().max(120).optional(),
  phone: z.string().trim().regex(PHONE_REGEX, PHONE_INVALID_MESSAGE).optional().or(z.literal('')),
  line1: z.string().trim().min(3, 'Please provide a complete shipping address.').max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, 'Please provide a complete shipping address.').max(80),
  state: z.string().trim().min(1, 'Please provide a complete shipping address.').max(80),
  postalCode: z.string().trim().regex(POSTAL_CODE_REGEX, POSTAL_CODE_INVALID_MESSAGE),
  country: z.string().trim().max(80).optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Your cart is empty.'),
  shippingAddress: shippingAddressSchema,
  deliveryInstructions: z.string().trim().max(300).optional(),
  paymentMethod: z.enum(['cod', 'razorpay']).optional().default('cod'),
  couponCode: z.string().trim().max(30).optional(),
  guestName: z.string().trim().max(120).optional(),
  guestEmail: z.string().trim().email().optional(),
  guestPhone: z.string().trim().regex(PHONE_REGEX, PHONE_INVALID_MESSAGE).optional().or(z.literal('')),
  isGuest: z.boolean().optional(),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const returnOrderSchema = z.object({
  reason: z.string().trim().min(3, 'Please tell us why you want to return this order.').max(500),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(orderStatusValues),
  note: z.string().trim().max(300).optional(),
});

export const refundOrderSchema = z.object({
  amount: z.coerce.number().positive().optional(),
  reason: z.string().trim().max(300).optional(),
});

export const assignDeliverySchema = z
  .object({
    clear: z.boolean().optional(),
    name: z.string().trim().min(1).max(120).optional(),
    phone: z.string().trim().regex(PHONE_REGEX, PHONE_INVALID_MESSAGE).optional().or(z.literal('')),
    notes: z.string().trim().max(300).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.clear && !data.name) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['name'],
        message: 'A delivery partner name is required.',
      });
    }
  });
