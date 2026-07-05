import { z } from 'zod';

const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1).max(180),
  alt: z.string().min(1).max(160),
});

const nutritionFactsSchema = z.object({
  servingSize: z.string().min(1).max(50),
  calories: z.coerce.number().min(0),
  protein: z.string().min(1).max(40),
  carbs: z.string().min(1).max(40),
  fat: z.string().min(1).max(40),
  sugar: z.string().min(1).max(40),
  sodium: z.string().min(1).max(40),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  brand: z.string().optional(),
  tags: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  trending: z.coerce.boolean().optional(),
  bestSeller: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export const createProductSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  description: z.string().min(20).max(2000),
  ingredients: z.array(z.string().min(1).max(80)).min(1),
  weight: z.string().min(1).max(50),
  nutritionFacts: nutritionFactsSchema,
  mrp: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).max(100).default(0),
  offerPrice: z.coerce.number().min(0),
  images: z.array(productImageSchema).min(1).max(8),
  category: z.string().min(1),
  subCategory: z.string().min(1).max(80),
  stock: z.coerce.number().int().min(0),
  availableQuantity: z.coerce.number().int().min(0),
  sku: z.string().min(3).max(80),
  brand: z.string().min(1).max(80),
  tags: z.array(z.string().min(1).max(40)).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  recommendedProducts: z.array(z.string()).default([]),
  relatedProducts: z.array(z.string()).default([]),
  deliveryEstimate: z.string().min(1).max(160),
  returnPolicy: z.string().min(1).max(500),
  shippingInformation: z.string().min(1).max(500),
});

export const updateProductSchema = createProductSchema.partial();
