import { Router } from 'express';

import {
  blockCustomer,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  getCustomerReviews,
  resetCustomerPassword,
  unblockCustomer,
} from '../controllers/adminUser.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

export const adminUserRoutes = Router();

adminUserRoutes.use(authenticate, authorize('admin'));

adminUserRoutes.get('/', getAllCustomers);
adminUserRoutes.get('/:id', getCustomerById);
adminUserRoutes.get('/:id/reviews', getCustomerReviews);
adminUserRoutes.patch('/:id/block', blockCustomer);
adminUserRoutes.patch('/:id/unblock', unblockCustomer);
adminUserRoutes.post('/:id/reset-password', resetCustomerPassword);
adminUserRoutes.delete('/:id', deleteCustomer);
