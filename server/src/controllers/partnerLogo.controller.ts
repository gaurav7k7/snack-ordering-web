import { StatusCodes } from 'http-status-codes';

import { PUBLIC_LIST_CACHE_CONTROL } from '../constants/cache.js';
import { PARTNER_LOGO_CATEGORIES, PartnerLogoModel } from '../models/PartnerLogo.model.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';

export const listPartnerLogos = asyncHandler(async (req, res) => {
  const includeInactive = req.query.includeInactive === 'true';
  const filter: Record<string, unknown> = includeInactive ? {} : { isActive: true };

  const category = req.query.category;
  if (typeof category === 'string' && (PARTNER_LOGO_CATEGORIES as readonly string[]).includes(category)) {
    filter.category = category;
  }

  const logos = await PartnerLogoModel.find(filter).sort({ order: 1, createdAt: 1 });

  // Logos change rarely (admin CRUD only) — a short public cache lets
  // browsers/CDNs skip the round trip for repeat homepage visits.
  res.set('Cache-Control', PUBLIC_LIST_CACHE_CONTROL);
  res.status(StatusCodes.OK).json(createApiResponse('Partner logos retrieved.', { logos }));
});

export const createPartnerLogo = asyncHandler(async (req, res) => {
  const { name, logo, link, category, order, isActive } = req.body;

  const resolvedOrder =
    typeof order === 'number' ? order : await PartnerLogoModel.countDocuments({ category });

  const partnerLogo = await PartnerLogoModel.create({
    name,
    logo,
    link,
    category,
    order: resolvedOrder,
    isActive,
  });

  res.status(StatusCodes.CREATED).json(createApiResponse('Partner logo created.', { logo: partnerLogo }));
});

export const updatePartnerLogo = asyncHandler(async (req, res) => {
  const partnerLogo = await PartnerLogoModel.findById(req.params.id);
  if (!partnerLogo) {
    throw new AppError('Partner logo not found.', StatusCodes.NOT_FOUND);
  }

  const { name, logo, link, category, order, isActive } = req.body;

  if (name !== undefined) partnerLogo.name = name;
  if (logo !== undefined) partnerLogo.logo = logo;
  if (link !== undefined) partnerLogo.link = link;
  if (category !== undefined) partnerLogo.category = category;
  if (typeof order === 'number') partnerLogo.order = order;
  if (typeof isActive === 'boolean') partnerLogo.isActive = isActive;

  await partnerLogo.save();

  res.status(StatusCodes.OK).json(createApiResponse('Partner logo updated.', { logo: partnerLogo }));
});

export const deletePartnerLogo = asyncHandler(async (req, res) => {
  const partnerLogo = await PartnerLogoModel.findByIdAndDelete(req.params.id);
  if (!partnerLogo) {
    throw new AppError('Partner logo not found.', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json(createApiResponse('Partner logo deleted.'));
});
