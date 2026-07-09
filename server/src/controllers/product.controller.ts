import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

import { CategoryModel } from '../models/Category.model.js';
import { ProductModel } from '../models/Product.model.js';
import {
  ensureUniqueProductSlug,
  getAllProductsForAdmin as getAllProductsForAdminService,
  getProductBySlug,
  getSearchSuggestions,
  searchProducts,
} from '../services/product.service.js';
import { AppError } from '../utils/AppError.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { slugify } from '../utils/slugify.js';
import { createProductSchema, updateProductSchema } from '../validation/product.validation.js';

export const listProducts = asyncHandler(async (req, res) => {
  const response = await searchProducts(req.query);
  res.status(StatusCodes.OK).json(createApiResponse('Products retrieved successfully.', response));
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await getProductBySlug(req.params.slug);

  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json(createApiResponse('Product retrieved successfully.', { product }));
});

export const getProductSearchSuggestions = asyncHandler(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const response = await getSearchSuggestions(q);
  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Search suggestions retrieved successfully.', response));
});

export const getAllProductsForAdmin = asyncHandler(async (req, res) => {
  const response = await getAllProductsForAdminService(req.query);
  res.status(StatusCodes.OK).json(createApiResponse('Products retrieved.', response));
});

export const getProductByIdForAdmin = asyncHandler(async (req, res) => {
  const product = await ProductModel.findById(req.params.id).populate('category', 'name slug');
  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json(createApiResponse('Product retrieved.', { product }));
});

function parseWithSchema<T>(schema: { parse: (input: unknown) => T }, body: unknown): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
      throw new AppError(message, StatusCodes.BAD_REQUEST);
    }
    throw error;
  }
}

async function resolveCategoryId(value: string): Promise<string> {
  if (mongoose.Types.ObjectId.isValid(value)) {
    const exists = await CategoryModel.exists({ _id: value });
    if (exists) return value;
  }

  const category = await CategoryModel.findOne({
    $or: [{ name: new RegExp(`^${value.trim()}$`, 'i') }, { slug: slugify(value) }],
  });

  if (!category) {
    throw new AppError(`Category "${value}" was not found. Create it first.`, StatusCodes.BAD_REQUEST);
  }

  return category._id.toString();
}

export const createProduct = asyncHandler(async (req, res) => {
  const parsed = parseWithSchema(createProductSchema, req.body);

  const existingSku = await ProductModel.exists({ sku: parsed.sku.toUpperCase() });
  if (existingSku) {
    throw new AppError('A product with this SKU already exists.', StatusCodes.CONFLICT);
  }

  const categoryId = await resolveCategoryId(parsed.category);
  const baseSlug = parsed.slug?.trim() ? slugify(parsed.slug) : slugify(parsed.name);
  const slug = await ensureUniqueProductSlug(baseSlug);

  const product = await ProductModel.create({ ...parsed, category: categoryId, slug });
  res.status(StatusCodes.CREATED).json(createApiResponse('Product created.', { product }));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  const parsed = parseWithSchema(updateProductSchema, req.body);

  if (parsed.sku && parsed.sku.toUpperCase() !== product.sku) {
    const existingSku = await ProductModel.exists({
      sku: parsed.sku.toUpperCase(),
      _id: { $ne: product._id },
    });
    if (existingSku) {
      throw new AppError('A product with this SKU already exists.', StatusCodes.CONFLICT);
    }
  }

  if (parsed.category) {
    parsed.category = await resolveCategoryId(parsed.category);
  }

  if (parsed.slug && slugify(parsed.slug) !== product.slug) {
    parsed.slug = await ensureUniqueProductSlug(slugify(parsed.slug), product._id.toString());
  } else {
    delete parsed.slug;
  }

  Object.assign(product, parsed);
  await product.save();

  res.status(StatusCodes.OK).json(createApiResponse('Product updated.', { product }));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.findByIdAndDelete(req.params.id);
  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }
  res.status(StatusCodes.OK).json(createApiResponse('Product deleted.'));
});

export const exportProducts = asyncHandler(async (_req, res) => {
  const products = await ProductModel.find().select('-reviews').populate('category', 'name').lean();
  res.status(StatusCodes.OK).json(createApiResponse('Products exported.', { products }));
});

const BULK_IMPORT_LIMIT = 500;

export const bulkImportProducts = asyncHandler(async (req, res) => {
  const rows = req.body?.products;

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new AppError('No products to import.', StatusCodes.BAD_REQUEST);
  }
  if (rows.length > BULK_IMPORT_LIMIT) {
    throw new AppError(`Bulk import is limited to ${BULK_IMPORT_LIMIT} products at a time.`, StatusCodes.BAD_REQUEST);
  }

  const results: { created: number; failed: Array<{ row: number; sku?: string; error: string }> } = {
    created: 0,
    failed: [],
  };

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];

    try {
      const parsed = createProductSchema.parse(row);

      const existingSku = await ProductModel.exists({ sku: parsed.sku.toUpperCase() });
      if (existingSku) {
        throw new Error(`SKU "${parsed.sku}" already exists.`);
      }

      const categoryId = await resolveCategoryId(parsed.category);
      const baseSlug = parsed.slug?.trim() ? slugify(parsed.slug) : slugify(parsed.name);
      const slug = await ensureUniqueProductSlug(baseSlug);

      await ProductModel.create({ ...parsed, category: categoryId, slug });
      results.created += 1;
    } catch (error) {
      const message =
        error instanceof ZodError
          ? error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')
          : error instanceof AppError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Unknown error.';

      results.failed.push({ row: index + 1, sku: row?.sku, error: message });
    }
  }

  res.status(StatusCodes.OK).json(createApiResponse('Bulk import completed.', results));
});
