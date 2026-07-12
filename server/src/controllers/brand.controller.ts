import { StatusCodes } from 'http-status-codes';

import { BrandModel } from '../models/Brand.model.js';
import { ProductModel } from '../models/Product.model.js';
import { ensureUniqueSlug } from '../services/slug.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { PUBLIC_LIST_CACHE_CONTROL } from '../constants/cache.js';
import { slugify } from '../utils/slugify.js';

export const listBrands = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const filter = includeInactive ? {} : { isActive: true };
  const brands = await BrandModel.find(filter).sort({ name: 1 });

  res.set('Cache-Control', PUBLIC_LIST_CACHE_CONTROL);
  res.status(StatusCodes.OK).json(createApiResponse('Brands retrieved.', { brands }));
});

export const createBrand = asyncHandler(async (req, res) => {
  const { name, description, logo } = req.body;

  const existing = await BrandModel.exists({ name });
  if (existing) {
    throw new AppError('A brand with this name already exists.', StatusCodes.CONFLICT);
  }

  const slug = await ensureUniqueSlug(BrandModel, slugify(name));

  const brand = await BrandModel.create({
    name,
    slug,
    description: description ?? '',
    logo,
  });

  res.status(StatusCodes.CREATED).json(createApiResponse('Brand created.', { brand }));
});

export const updateBrand = asyncHandler(async (req, res) => {
  const brand = await BrandModel.findById(req.params.id);
  if (!brand) {
    throw new AppError('Brand not found.', StatusCodes.NOT_FOUND);
  }

  const { name, description, logo, isActive } = req.body;
  const previousName = brand.name;

  if (name && name !== brand.name) {
    const existing = await BrandModel.exists({ name, _id: { $ne: brand._id } });
    if (existing) {
      throw new AppError('A brand with this name already exists.', StatusCodes.CONFLICT);
    }
    brand.name = name;
    brand.slug = await ensureUniqueSlug(BrandModel, slugify(name), brand._id.toString());
  }

  if (description !== undefined) brand.description = description;
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
