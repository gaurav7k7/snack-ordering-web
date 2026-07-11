import { Router } from 'express';

import {
  createCoupon,
  deleteCoupon,
  getAutomaticOffer,
  getCouponById,
  getCouponUsage,
  listCoupons,
  updateCoupon,
  validateCoupon,
} from '../controllers/coupon.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from '../validation/coupon.validation.js';

export const couponRoutes = Router();

couponRoutes.post('/validate', optionalAuthenticate, validateRequest({ body: validateCouponSchema }), validateCoupon);
couponRoutes.get('/automatic', optionalAuthenticate, getAutomaticOffer);

couponRoutes.get('/', authenticate, authorize('admin'), listCoupons);
couponRoutes.post(
  '/',
  authenticate,
  authorize('admin'),
  validateRequest({ body: createCouponSchema }),
  createCoupon,
);
couponRoutes.get('/:id', authenticate, authorize('admin'), getCouponById);
couponRoutes.get('/:id/usage', authenticate, authorize('admin'), getCouponUsage);
couponRoutes.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  validateRequest({ body: updateCouponSchema }),
  updateCoupon,
);
couponRoutes.delete('/:id', authenticate, authorize('admin'), deleteCoupon);
