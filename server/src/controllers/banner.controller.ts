import { StatusCodes } from 'http-status-codes';

import { BannerModel } from '../models/Banner.model.js';
import { PUBLIC_LIST_CACHE_CONTROL } from '../constants/cache.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';

export const listBanners = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const filter = includeInactive ? {} : { isActive: true };
  const banners = await BannerModel.find(filter).sort({ order: 1, createdAt: 1 });

  // Banners change rarely (admin CRUD only) — a short public cache lets
  // browsers/CDNs skip the round trip for repeat homepage visits.
  res.set('Cache-Control', PUBLIC_LIST_CACHE_CONTROL);
  res.status(StatusCodes.OK).json(createApiResponse('Banners retrieved.', { banners }));
});

export const createBanner = asyncHandler(async (req, res) => {
  const { heading, subheading, description, buttonText, buttonLink, image, order, isActive } = req.body;

  const resolvedOrder =
    typeof order === 'number' ? order : ((await BannerModel.countDocuments({})) as number);

  const banner = await BannerModel.create({
    heading,
    subheading,
    description,
    buttonText,
    buttonLink,
    image,
    order: resolvedOrder,
    isActive,
  });

  res.status(StatusCodes.CREATED).json(createApiResponse('Banner created.', { banner }));
});

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await BannerModel.findById(req.params.id);
  if (!banner) {
    throw new AppError('Banner not found.', StatusCodes.NOT_FOUND);
  }

  const { heading, subheading, description, buttonText, buttonLink, image, order, isActive } = req.body;

  if (heading !== undefined) banner.heading = heading;
  if (subheading !== undefined) banner.subheading = subheading;
  if (description !== undefined) banner.description = description;
  if (buttonText !== undefined) banner.buttonText = buttonText;
  if (buttonLink !== undefined) banner.buttonLink = buttonLink;
  if (image !== undefined) banner.image = image ?? undefined;
  if (typeof order === 'number') banner.order = order;
  if (typeof isActive === 'boolean') banner.isActive = isActive;

  await banner.save();

  res.status(StatusCodes.OK).json(createApiResponse('Banner updated.', { banner }));
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await BannerModel.findByIdAndDelete(req.params.id);
  if (!banner) {
    throw new AppError('Banner not found.', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json(createApiResponse('Banner deleted.'));
});
