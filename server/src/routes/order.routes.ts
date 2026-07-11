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
import { validateRequest } from '../middleware/validateRequest.js';
import {
  assignDeliverySchema,
  cancelOrderSchema,
  createOrderSchema,
  refundOrderSchema,
  returnOrderSchema,
  updateOrderStatusSchema,
  verifyPaymentSchema,
} from '../validation/order.validation.js';

export const orderRoutes = Router();

orderRoutes.post('/', optionalAuthenticate, validateRequest({ body: createOrderSchema }), createOrder);
orderRoutes.post(
  '/verify-payment',
  optionalAuthenticate,
  validateRequest({ body: verifyPaymentSchema }),
  verifyPayment,
);

orderRoutes.get('/', authenticate, getMyOrders);

orderRoutes.get('/admin', authenticate, authorize('admin'), getAllOrdersForAdmin);
orderRoutes.get('/admin/:id', authenticate, authorize('admin'), getOrderByIdForAdmin);
orderRoutes.get('/admin/:id/invoice', authenticate, authorize('admin'), getInvoiceForAdmin);
orderRoutes.post(
  '/admin/:id/cancel',
  authenticate,
  authorize('admin'),
  validateRequest({ body: cancelOrderSchema }),
  adminCancelOrder,
);
orderRoutes.post(
  '/admin/:id/refund',
  authenticate,
  authorize('admin'),
  validateRequest({ body: refundOrderSchema }),
  refundOrder,
);
orderRoutes.patch(
  '/admin/:id/assign-delivery',
  authenticate,
  authorize('admin'),
  validateRequest({ body: assignDeliverySchema }),
  assignDelivery,
);

orderRoutes.get('/:id', authenticate, getOrderById);
orderRoutes.get('/:id/invoice', authenticate, getInvoice);
orderRoutes.post('/:id/cancel', authenticate, validateRequest({ body: cancelOrderSchema }), cancelOrder);
orderRoutes.post('/:id/return', authenticate, validateRequest({ body: returnOrderSchema }), requestReturn);
orderRoutes.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validateRequest({ body: updateOrderStatusSchema }),
  updateOrderStatus,
);
