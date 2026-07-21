import { StatusCodes } from 'http-status-codes';

import { PUBLIC_LIST_CACHE_CONTROL } from '../constants/cache.js';
import { SiteSettingsModel } from '../models/SiteSettings.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';

async function loadOrCreateSettings() {
  return SiteSettingsModel.findOneAndUpdate({}, {}, { upsert: true, new: true, setDefaultsOnInsert: true });
}

export const getSiteSettings = asyncHandler(async (_req, res) => {
  const settings = await loadOrCreateSettings();

  // Settings change rarely (admin CRUD only) — a short public cache lets
  // browsers/CDNs skip the round trip for repeat homepage visits.
  res.set('Cache-Control', PUBLIC_LIST_CACHE_CONTROL);
  res.status(StatusCodes.OK).json(createApiResponse('Site settings retrieved.', { settings }));
});

export const updateSiteSettings = asyncHandler(async (req, res) => {
  const { announcementText } = req.body;

  const settings = await SiteSettingsModel.findOneAndUpdate(
    {},
    { announcementText },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  res.status(StatusCodes.OK).json(createApiResponse('Site settings updated.', { settings }));
});
