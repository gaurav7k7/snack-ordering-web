import { Router } from 'express';

import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../controllers/category.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

export const categoryRoutes = Router();

categoryRoutes.get('/', listCategories);
categoryRoutes.post('/', authenticate, authorize('admin'), createCategory);
categoryRoutes.patch('/:id', authenticate, authorize('admin'), updateCategory);
categoryRoutes.delete('/:id', authenticate, authorize('admin'), deleteCategory);
