import { Router } from 'express';

import {
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
  updateAddresses,
  updateProfile,
  updateWishlist,
  uploadProfilePicture,
} from '../controllers/profile.controller.js';
import { authenticate } from '../middleware/authMiddleware.js';

export const profileRoutes = Router();

profileRoutes.use(authenticate);
profileRoutes.get('/', getProfile);
profileRoutes.patch('/', updateProfile);
profileRoutes.post('/avatar', uploadProfilePicture);
profileRoutes.put('/addresses', updateAddresses);
profileRoutes.get('/orders', getOrderHistory);
profileRoutes.get('/wishlist', getWishlist);
profileRoutes.put('/wishlist', updateWishlist);
profileRoutes.get('/wallet', getWallet);
profileRoutes.get('/notifications', getNotifications);
profileRoutes.post('/change-password', changePassword);
profileRoutes.delete('/account', deleteAccount);
profileRoutes.get('/support-tickets', getSupportTickets);
profileRoutes.get('/recently-viewed', getRecentlyViewed);
profileRoutes.get('/reviews', getReviewHistory);
