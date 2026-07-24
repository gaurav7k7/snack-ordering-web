import { StatusCodes } from 'http-status-codes';

import { PUBLIC_LIST_CACHE_CONTROL } from '../constants/cache.js';
import { SiteSettingsModel } from '../models/SiteSettings.model.js';
import { getOrCreateSiteSettings } from '../services/siteSettings.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';

export const getSiteSettings = asyncHandler(async (_req, res) => {
  const settings = await getOrCreateSiteSettings();

  // Settings change rarely (admin CRUD only) — a short public cache lets
  // browsers/CDNs skip the round trip for repeat homepage visits.
  res.set('Cache-Control', PUBLIC_LIST_CACHE_CONTROL);
  res.status(StatusCodes.OK).json(createApiResponse('Site settings retrieved.', { settings }));
});

export const updateSiteSettings = asyncHandler(async (req, res) => {
  const { announcementText, b2bClientsHeading, mediaCoverageHeading, galleryHeading, company } = req.body;

  const update: Record<string, string> = {};
  if (announcementText !== undefined) update.announcementText = announcementText;
  if (b2bClientsHeading !== undefined) update.b2bClientsHeading = b2bClientsHeading;
  if (mediaCoverageHeading !== undefined) update.mediaCoverageHeading = mediaCoverageHeading;
  if (galleryHeading !== undefined) update.galleryHeading = galleryHeading;

  // Dot-path keys (`company.name`, `company.phone`, ...) so a partial save
  // only touches the fields the admin actually edited, instead of a plain
  // `{ company: {...} }` assignment replacing the whole nested object and
  // wiping out any sibling fields that weren't sent in this request.
  if (company && typeof company === 'object') {
    for (const [key, value] of Object.entries(company as Record<string, unknown>)) {
      if (value !== undefined) update[`company.${key}`] = value as string;
    }
  }

  const settings = await SiteSettingsModel.findOneAndUpdate({}, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  res.status(StatusCodes.OK).json(createApiResponse('Site settings updated.', { settings }));
});
