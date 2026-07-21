import { Router } from 'express';

import { createBanner, deleteBanner, listBanners, updateBanner } from '../controllers/banner.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createBannerSchema, updateBannerSchema } from '../validation/banner.validation.js';

export const bannerRoutes = Router();

bannerRoutes.get('/', listBanners);
bannerRoutes.post('/', authenticate, authorize('admin'), validateRequest({ body: createBannerSchema }), createBanner);
bannerRoutes.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest({ body: updateBannerSchema }),
  updateBanner,
);
bannerRoutes.delete('/:id', authenticate, authorize('admin'), deleteBanner);
