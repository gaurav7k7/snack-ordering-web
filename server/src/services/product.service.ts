import type { FilterQuery } from 'mongoose';
import { ProductModel } from '../models/Product.model.js';

export type SearchProductsParams = {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  availability?: string;
  discount?: string;
  sort?: string;
  page?: string;
  limit?: string;
  ids?: string;
};

export const PRODUCT_CARD_FIELDS =
  'name slug images offerPrice mrp discount averageRating reviewCount category isFeatured isTrending isBestSeller availableQuantity brand subCategory stock';

const SORT_MAP: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  popularity: { reviewCount: -1 },
  price_low_to_high: { offerPrice: 1 },
  price_high_to_low: { offerPrice: -1 },
  highest_rated: { averageRating: -1 },
  best_selling: { reviewCount: -1 },
};

function parseNumber(value?: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildQuery(params: SearchProductsParams): FilterQuery<Record<string, unknown>> {
  const query: FilterQuery<Record<string, unknown>> = { isActive: true };

  if (params.q?.trim()) {
    query.$text = { $search: params.q.trim() };
  }

  if (params.ids?.trim()) {
    query._id = {
      $in: params.ids
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    };
  }

  if (params.category?.trim()) {
    query.category = { $in: params.category.split(',').map((value) => value.trim()) };
  }

  if (params.brand?.trim()) {
    query.brand = { $in: params.brand.split(',').map((value) => value.trim()) };
  }

  const minPrice = parseNumber(params.minPrice, -1);
  const maxPrice = parseNumber(params.maxPrice, -1);

  if (minPrice >= 0 || maxPrice >= 0) {
    query.offerPrice = {} as Record<string, unknown>;
    if (minPrice >= 0) {
      (query.offerPrice as Record<string, number>).$gte = minPrice;
    }
    if (maxPrice >= 0) {
      (query.offerPrice as Record<string, number>).$lte = maxPrice;
    }
  }

  const rating = parseNumber(params.rating, 0);
  if (rating > 0) {
    query.averageRating = { $gte: rating };
  }

  if (params.availability) {
    if (params.availability === 'available') {
      query.availableQuantity = { $gt: 0 };
    } else {
      query.stock = params.availability;
    }
  }

  const discount = parseNumber(params.discount, -1);
  if (discount >= 0) {
    query.discount = { $gte: discount };
  }

  return query;
}

export async function searchProducts(params: SearchProductsParams) {
  const page = Math.max(parseNumber(params.page, 1), 1);
  const limit = Math.min(Math.max(parseNumber(params.limit, 16), 1), 100);
  const query = buildQuery(params);
  const sort = SORT_MAP[params.sort ?? 'newest'] ?? { isFeatured: -1, createdAt: -1 };

  const [products, total] = await Promise.all([
    ProductModel.find(query)
      .select('-reviews')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    ProductModel.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
}

export async function getSearchSuggestions(query = '') {
  const popularSearches = [
    'Popcorn',
    'Combo pack',
    'Trail mix',
    'Best seller',
    'New arrival',
    'Gift set',
  ];

  if (!query.trim()) {
    return {
      suggestions: [] as string[],
      popularSearches,
    };
  }

  const products = await ProductModel.find({ isActive: true, $text: { $search: query.trim() } })
    .sort({ reviewCount: -1 })
    .limit(10)
    .select('name category brand tags')
    .lean();

  const suggestionSet = new Set<string>();
  products.forEach((product) => {
    if (typeof product.name === 'string') suggestionSet.add(product.name);
    if (typeof product.category === 'string') suggestionSet.add(product.category);
    if (typeof product.brand === 'string') suggestionSet.add(product.brand);
    if (Array.isArray(product.tags)) {
      product.tags.slice(0, 3).forEach((tag) => {
        if (typeof tag === 'string') suggestionSet.add(tag);
      });
    }
  });

  return {
    suggestions: Array.from(suggestionSet).slice(0, 12),
    popularSearches,
  };
}

export async function getProductBySlug(slug: string) {
  return ProductModel.findOne({ slug, isActive: true })
    .select('-reviews')
    .populate('category', 'name slug')
    .populate('recommendedProducts', PRODUCT_CARD_FIELDS)
    .populate('relatedProducts', PRODUCT_CARD_FIELDS)
    .lean();
}
