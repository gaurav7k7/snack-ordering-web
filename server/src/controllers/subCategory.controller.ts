import { StatusCodes } from 'http-status-codes';

import { CategoryModel } from '../models/Category.model.js';
import { ProductModel } from '../models/Product.model.js';
import { SubCategoryModel } from '../models/SubCategory.model.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { slugify } from '../utils/slugify.js';

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  let slug = baseSlug;
  let counter = 2;

  while (
    await SubCategoryModel.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export const listSubCategories = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const categoryId = typeof req.query.category === 'string' ? req.query.category : undefined;

  const filter: Record<string, unknown> = includeInactive ? {} : { isActive: true };
  if (categoryId) filter.category = categoryId;

  const subCategories = await SubCategoryModel.find(filter)
    .populate('category', 'name slug')
    .sort({ name: 1 });

  res.status(StatusCodes.OK).json(createApiResponse('Subcategories retrieved.', { subCategories }));
});

export const createSubCategory = asyncHandler(async (req, res) => {
  const { name, category, description } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    throw new AppError('Subcategory name is required.', StatusCodes.BAD_REQUEST);
  }
  if (typeof category !== 'string' || !category.trim()) {
    throw new AppError('A parent category is required.', StatusCodes.BAD_REQUEST);
  }

  const parentCategory = await CategoryModel.findById(category);
  if (!parentCategory) {
    throw new AppError('Parent category not found.', StatusCodes.NOT_FOUND);
  }

  const trimmedName = name.trim();
  const existing = await SubCategoryModel.exists({ name: trimmedName, category });
  if (existing) {
    throw new AppError('This subcategory already exists under the selected category.', StatusCodes.CONFLICT);
  }

  const slug = await ensureUniqueSlug(slugify(`${parentCategory.name}-${trimmedName}`));

  const subCategory = await SubCategoryModel.create({
    name: trimmedName,
    slug,
    category,
    description: typeof description === 'string' ? description.trim() : '',
  });

  res.status(StatusCodes.CREATED).json(createApiResponse('Subcategory created.', { subCategory }));
});

export const updateSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await SubCategoryModel.findById(req.params.id);
  if (!subCategory) {
    throw new AppError('Subcategory not found.', StatusCodes.NOT_FOUND);
  }

  const { name, description, isActive } = req.body ?? {};
  const previousName = subCategory.name;

  if (typeof name === 'string' && name.trim() && name.trim() !== subCategory.name) {
    const trimmedName = name.trim();
    const existing = await SubCategoryModel.exists({
      name: trimmedName,
      category: subCategory.category,
      _id: { $ne: subCategory._id },
    });
    if (existing) {
      throw new AppError('This subcategory already exists under the selected category.', StatusCodes.CONFLICT);
    }
    subCategory.name = trimmedName;
  }

  if (typeof description === 'string') subCategory.description = description.trim();
  if (typeof isActive === 'boolean') subCategory.isActive = isActive;

  await subCategory.save();

  if (subCategory.name !== previousName) {
    await ProductModel.updateMany(
      { subCategory: previousName, category: subCategory.category },
      { subCategory: subCategory.name },
    );
  }

  res.status(StatusCodes.OK).json(createApiResponse('Subcategory updated.', { subCategory }));
});

export const deleteSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await SubCategoryModel.findById(req.params.id);
  if (!subCategory) {
    throw new AppError('Subcategory not found.', StatusCodes.NOT_FOUND);
  }

  const inUse = await ProductModel.exists({ subCategory: subCategory.name, category: subCategory.category });
  if (inUse) {
    throw new AppError(
      'This subcategory has products assigned to it. Reassign or delete those products first.',
      StatusCodes.BAD_REQUEST,
    );
  }

  await SubCategoryModel.deleteOne({ _id: subCategory._id });

  res.status(StatusCodes.OK).json(createApiResponse('Subcategory deleted.'));
});
