import { StatusCodes } from 'http-status-codes';

import { CategoryModel } from '../models/Category.model.js';
import { ProductModel } from '../models/Product.model.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { slugify } from '../utils/slugify.js';

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  let slug = baseSlug;
  let counter = 2;

  while (
    await CategoryModel.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export const listCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const filter = includeInactive ? {} : { isActive: true };
  const categories = await CategoryModel.find(filter).sort({ name: 1 });

  // Categories change rarely (admin CRUD only) — a short public cache lets
  // browsers/CDNs skip the round trip for repeat visits within the window.
  res.set('Cache-Control', 'public, max-age=60');
  res.status(StatusCodes.OK).json(createApiResponse('Categories retrieved.', { categories }));
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  const existing = await CategoryModel.exists({ name });
  if (existing) {
    throw new AppError('A category with this name already exists.', StatusCodes.CONFLICT);
  }

  const slug = await ensureUniqueSlug(slugify(name));

  const category = await CategoryModel.create({
    name,
    slug,
    description: description ?? '',
    image,
  });

  res.status(StatusCodes.CREATED).json(createApiResponse('Category created.', { category }));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await CategoryModel.findById(req.params.id);
  if (!category) {
    throw new AppError('Category not found.', StatusCodes.NOT_FOUND);
  }

  const { name, description, image, isActive } = req.body;

  if (name && name !== category.name) {
    const existing = await CategoryModel.exists({ name, _id: { $ne: category._id } });
    if (existing) {
      throw new AppError('A category with this name already exists.', StatusCodes.CONFLICT);
    }
    category.name = name;
    category.slug = await ensureUniqueSlug(slugify(name), category._id.toString());
  }

  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (typeof isActive === 'boolean') category.isActive = isActive;

  await category.save();

  res.status(StatusCodes.OK).json(createApiResponse('Category updated.', { category }));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await ProductModel.exists({ category: req.params.id });
  if (inUse) {
    throw new AppError(
      'This category has products assigned to it. Reassign or delete those products first.',
      StatusCodes.BAD_REQUEST,
    );
  }

  const category = await CategoryModel.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new AppError('Category not found.', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json(createApiResponse('Category deleted.'));
});
