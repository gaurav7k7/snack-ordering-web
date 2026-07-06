import { Router } from 'express';

import { createOrder } from '../controllers/order.controller.js';
import { optionalAuthenticate } from '../middleware/authMiddleware.js';

export const orderRoutes = Router();

orderRoutes.post('/', optionalAuthenticate, createOrder);
