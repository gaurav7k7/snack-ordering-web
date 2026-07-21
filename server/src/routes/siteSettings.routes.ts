import { Router } from 'express';

import { getSiteSettings, updateSiteSettings } from '../controllers/siteSettings.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { updateSiteSettingsSchema } from '../validation/siteSettings.validation.js';

export const siteSettingsRoutes = Router();

siteSettingsRoutes.get('/', getSiteSettings);
siteSettingsRoutes.patch(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest({ body: updateSiteSettingsSchema }),
  updateSiteSettings,
);
