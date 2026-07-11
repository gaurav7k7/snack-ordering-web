import { Router } from 'express';

import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createCategorySchema, updateCategorySchema } from '../validation/taxonomy.validation.js';

export const categoryRoutes = Router();

categoryRoutes.get('/', listCategories);
categoryRoutes.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest({ body: createCategorySchema }),
  createCategory,
);
categoryRoutes.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest({ body: updateCategorySchema }),
  updateCategory,
);
categoryRoutes.delete('/:id', authenticate, authorize('admin'), deleteCategory);
