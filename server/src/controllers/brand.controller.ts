import { StatusCodes } from 'http-status-codes';

import { BrandModel } from '../models/Brand.model.js';
import { ProductModel } from '../models/Product.model.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { slugify } from '../utils/slugify.js';

async function ensureUniqueSlug(baseSlug: string, excludeId?: string) {
  let slug = baseSlug;
  let counter = 2;

  while (
    await BrandModel.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}

export const listBrands = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const filter = includeInactive ? {} : { isActive: true };
  const brands = await BrandModel.find(filter).sort({ name: 1 });

  res.status(StatusCodes.OK).json(createApiResponse('Brands retrieved.', { brands }));
});

export const createBrand = asyncHandler(async (req, res) => {
  const { name, description, logo } = req.body ?? {};

  if (typeof name !== 'string' || !name.trim()) {
    throw new AppError('Brand name is required.', StatusCodes.BAD_REQUEST);
  }

  const trimmedName = name.trim();
  const existing = await BrandModel.exists({ name: trimmedName });
  if (existing) {
    throw new AppError('A brand with this name already exists.', StatusCodes.CONFLICT);
  }

  const slug = await ensureUniqueSlug(slugify(trimmedName));

  const brand = await BrandModel.create({
    name: trimmedName,
    slug,
    description: typeof description === 'string' ? description.trim() : '',
    logo,
  });

  res.status(StatusCodes.CREATED).json(createApiResponse('Brand created.', { brand }));
});

export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await BrandModel.findById(req.params.id);
  if (!brand) {
    throw new AppError('Brand not found.', StatusCodes.NOT_FOUND);
  }

  const { name, description, logo, isActive } = req.body ?? {};
  const previousName = brand.name;

  if (typeof name === 'string' && name.trim() && name.trim() !== brand.name) {
    const trimmedName = name.trim();
    const existing = await BrandModel.exists({ name: trimmedName, _id: { $ne: brand._id } });
    if (existing) {
      throw new AppError('A brand with this name already exists.', StatusCodes.CONFLICT);
    }
    brand.name = trimmedName;
    brand.slug = await ensureUniqueSlug(slugify(trimmedName), brand._id.toString());
  }

  if (typeof description === 'string') brand.description = description.trim();
  if (logo !== undefined) brand.logo = logo;
  if (typeof isActive === 'boolean') brand.isActive = isActive;

  await brand.save();

  if (brand.name !== previousName) {
    await ProductModel.updateMany({ brand: previousName }, { brand: brand.name });
  }

  res.status(StatusCodes.OK).json(createApiResponse('Brand updated.', { brand }));
});

export const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await BrandModel.findById(req.params.id);
  if (!brand) {
    throw new AppError('Brand not found.', StatusCodes.NOT_FOUND);
  }

  const inUse = await ProductModel.exists({ brand: brand.name });
  if (inUse) {
    throw new AppError(
      'This brand has products assigned to it. Reassign or delete those products first.',
      StatusCodes.BAD_REQUEST,
    );
  }

  await BrandModel.deleteOne({ _id: brand._id });

  res.status(StatusCodes.OK).json(createApiResponse('Brand deleted.'));
});
