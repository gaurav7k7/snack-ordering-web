import { Router } from 'express';

import {
  cancelOrder,
  createOrder,
  getInvoice,
  getMyOrders,
  getOrderById,
  requestReturn,
  updateOrderStatus,
  verifyPayment,
} from '../controllers/order.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/authMiddleware.js';

export const orderRoutes = Router();

orderRoutes.post('/', optionalAuthenticate, createOrder);
orderRoutes.post('/verify-payment', optionalAuthenticate, verifyPayment);

orderRoutes.get('/', authenticate, getMyOrders);
orderRoutes.get('/:id', authenticate, getOrderById);
orderRoutes.get('/:id/invoice', authenticate, getInvoice);
orderRoutes.post('/:id/cancel', authenticate, cancelOrder);
orderRoutes.post('/:id/return', authenticate, requestReturn);
orderRoutes.patch('/:id/status', authenticate, authorize('admin'), updateOrderStatus);
