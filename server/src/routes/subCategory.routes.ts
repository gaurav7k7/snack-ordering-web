import { Router } from 'express';

import {
  createSubCategory,
  deleteSubCategory,
  listSubCategories,
  updateSubCategory,
} from '../controllers/subCategory.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createSubCategorySchema, updateSubCategorySchema } from '../validation/taxonomy.validation.js';

export const subCategoryRoutes = Router();

subCategoryRoutes.get('/', listSubCategories);
subCategoryRoutes.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest({ body: createSubCategorySchema }),
  createSubCategory,
);
subCategoryRoutes.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest({ body: updateSubCategorySchema }),
  updateSubCategory,
);
subCategoryRoutes.delete('/:id', authenticate, authorize('admin'), deleteSubCategory);
