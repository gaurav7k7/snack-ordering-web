import { Router } from 'express';

import {
  createSubCategory,
  deleteSubCategory,
  listSubCategories,
  updateSubCategory,
} from '../controllers/subCategory.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

export const subCategoryRoutes = Router();

subCategoryRoutes.get('/', listSubCategories);
subCategoryRoutes.post('/', authenticate, authorize('admin'), createSubCategory);
subCategoryRoutes.patch('/:id', authenticate, authorize('admin'), updateSubCategory);
subCategoryRoutes.delete('/:id', authenticate, authorize('admin'), deleteSubCategory);
