import { Router } from 'express';

import {
  adminCancelOrder,
  assignDelivery,
  cancelOrder,
  createOrder,
  getAllOrdersForAdmin,
  getInvoice,
  getInvoiceForAdmin,
  getMyOrders,
  getOrderById,
  getOrderByIdForAdmin,
  refundOrder,
  requestReturn,
  updateOrderStatus,
  verifyPayment,
} from '../controllers/order.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/authMiddleware.js';

export const orderRoutes = Router();

orderRoutes.post('/', optionalAuthenticate, createOrder);
orderRoutes.post('/verify-payment', optionalAuthenticate, verifyPayment);

orderRoutes.get('/', authenticate, getMyOrders);

orderRoutes.get('/admin', authenticate, authorize('admin'), getAllOrdersForAdmin);
orderRoutes.get('/admin/:id', authenticate, authorize('admin'), getOrderByIdForAdmin);
orderRoutes.get('/admin/:id/invoice', authenticate, authorize('admin'), getInvoiceForAdmin);
orderRoutes.post('/admin/:id/cancel', authenticate, authorize('admin'), adminCancelOrder);
orderRoutes.post('/admin/:id/refund', authenticate, authorize('admin'), refundOrder);
orderRoutes.patch('/admin/:id/assign-delivery', authenticate, authorize('admin'), assignDelivery);

orderRoutes.get('/:id', authenticate, getOrderById);
orderRoutes.get('/:id/invoice', authenticate, getInvoice);
orderRoutes.post('/:id/cancel', authenticate, cancelOrder);
orderRoutes.post('/:id/return', authenticate, requestReturn);
orderRoutes.patch('/:id/status', authenticate, authorize('admin'), updateOrderStatus);
