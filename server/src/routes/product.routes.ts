import { Router } from 'express';

import { getProductSearchSuggestions, listProducts } from '../controllers/product.controller.js';

export const productRoutes = Router();

productRoutes.get('/suggestions', getProductSearchSuggestions);
productRoutes.get('/', listProducts);
