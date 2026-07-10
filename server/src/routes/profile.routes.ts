import { Router } from 'express';

import {
  addToWishlist,
  changePassword,
  deleteAccount,
  getNotifications,
  getOrderHistory,
  getProfile,
  getRecentlyViewed,
  getReviewHistory,
  getSupportTickets,
  getWallet,
  getWishlist,
  removeFromWishlist,
  updateAddresses,
  updateProfile,
  uploadProfilePicture,
} from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  changePasswordSchema,
  updateAddressesSchema,
  updateProfileSchema,
} from '../validation/profile.validation.js';

export const profileRoutes = Router();

profileRoutes.use(authenticate);
profileRoutes.get('/', getProfile);
profileRoutes.patch('/', validateRequest({ body: updateProfileSchema }), updateProfile);
profileRoutes.post('/avatar', uploadProfilePicture);
profileRoutes.put('/addresses', validateRequest({ body: updateAddressesSchema }), updateAddresses);
profileRoutes.get('/orders', getOrderHistory);
profileRoutes.get('/wishlist', getWishlist);
profileRoutes.post('/wishlist/:productId', addToWishlist);
profileRoutes.delete('/wishlist/:productId', removeFromWishlist);
profileRoutes.get('/wallet', getWallet);
profileRoutes.get('/notifications', getNotifications);
profileRoutes.post(
  '/change-password',
  validateRequest({ body: changePasswordSchema }),
  changePassword,
);
profileRoutes.delete('/account', deleteAccount);
profileRoutes.get('/support-tickets', getSupportTickets);
profileRoutes.get('/recently-viewed', getRecentlyViewed);
profileRoutes.get('/reviews', getReviewHistory);
