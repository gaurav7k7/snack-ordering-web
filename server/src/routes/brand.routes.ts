import { Router } from 'express';

import { createBrand, deleteBrand, listBrands, updateBrand } from '../controllers/brand.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createBrandSchema, updateBrandSchema } from '../validation/taxonomy.validation.js';

export const brandRoutes = Router();

brandRoutes.get('/', listBrands);
brandRoutes.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest({ body: createBrandSchema }),
  createBrand,
);
brandRoutes.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest({ body: updateBrandSchema }),
  updateBrand,
);
brandRoutes.delete('/:id', authenticate, authorize('admin'), deleteBrand);
