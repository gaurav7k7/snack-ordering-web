import { Router } from 'express';

import { getProduct, getProductSearchSuggestions, listProducts } from '../controllers/product.controller.js';
import { reviewRoutes } from './review.routes.js';

export const productRoutes = Router();

productRoutes.get('/suggestions', getProductSearchSuggestions);
productRoutes.use('/:productId/reviews', reviewRoutes);
productRoutes.get('/:slug', getProduct);
productRoutes.get('/', listProducts);
