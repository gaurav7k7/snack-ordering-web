import { Router } from 'express';

import { createBrand, deleteBrand, listBrands, updateBrand } from '../controllers/brand.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

export const brandRoutes = Router();

brandRoutes.get('/', listBrands);
brandRoutes.post('/', authenticate, authorize('admin'), createBrand);
brandRoutes.patch('/:id', authenticate, authorize('admin'), updateBrand);
brandRoutes.delete('/:id', authenticate, authorize('admin'), deleteBrand);
