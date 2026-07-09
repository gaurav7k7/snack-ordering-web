import { Router } from 'express';

import {
  createCoupon,
  deleteCoupon,
  getAutomaticOffer,
  getCouponById,
  listCoupons,
  updateCoupon,
  validateCoupon,
} from '../controllers/coupon.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/authMiddleware.js';

export const couponRoutes = Router();

couponRoutes.post('/validate', optionalAuthenticate, validateCoupon);
couponRoutes.get('/automatic', optionalAuthenticate, getAutomaticOffer);

couponRoutes.get('/', authenticate, authorize('admin'), listCoupons);
couponRoutes.post('/', authenticate, authorize('admin'), createCoupon);
couponRoutes.get('/:id', authenticate, authorize('admin'), getCouponById);
couponRoutes.patch('/:id', authenticate, authorize('admin'), updateCoupon);
couponRoutes.delete('/:id', authenticate, authorize('admin'), deleteCoupon);
