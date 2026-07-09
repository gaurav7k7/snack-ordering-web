import { Router } from 'express';

import {
  bulkImportProducts,
  createProduct,
  deleteProduct,
  exportProducts,
  getAllProductsForAdmin,
  getProduct,
  getProductByIdForAdmin,
  getProductSearchSuggestions,
  listProducts,
  updateProduct,
} from '../controllers/product.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { reviewRoutes } from './review.routes.js';

export const productRoutes = Router();

productRoutes.get('/suggestions', getProductSearchSuggestions);
productRoutes.use('/:productId/reviews', reviewRoutes);

productRoutes.get('/admin/export', authenticate, authorize('admin'), exportProducts);
productRoutes.post('/admin/bulk-import', authenticate, authorize('admin'), bulkImportProducts);
productRoutes.get('/admin/:id', authenticate, authorize('admin'), getProductByIdForAdmin);
productRoutes.get('/admin', authenticate, authorize('admin'), getAllProductsForAdmin);

productRoutes.post('/', authenticate, authorize('admin'), createProduct);
productRoutes.patch('/:id', authenticate, authorize('admin'), updateProduct);
productRoutes.delete('/:id', authenticate, authorize('admin'), deleteProduct);

productRoutes.get('/:slug', getProduct);
productRoutes.get('/', listProducts);
