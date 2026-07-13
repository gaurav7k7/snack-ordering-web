import { Router } from 'express';

import {
  deleteSubscriber,
  exportSubscribers,
  getSubscribers,
} from '../controllers/adminNewsletter.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { exportSubscribersQuerySchema, listSubscribersQuerySchema } from '../validation/adminNewsletter.validation.js';

export const adminNewsletterRoutes = Router();

adminNewsletterRoutes.use(authenticate, authorize('admin'));

adminNewsletterRoutes.get('/subscribers', validateRequest({ query: listSubscribersQuerySchema }), getSubscribers);
adminNewsletterRoutes.get(
  '/subscribers/export',
  validateRequest({ query: exportSubscribersQuerySchema }),
  exportSubscribers,
);
adminNewsletterRoutes.delete('/subscribers/:id', deleteSubscriber);
