import { Router } from 'express';

import { dismissReports, listAllReviewsForAdmin } from '../controllers/reviewAdmin.controller.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

export const reviewAdminRoutes = Router();

reviewAdminRoutes.use(authenticate, authorize('admin'));

reviewAdminRoutes.get('/', listAllReviewsForAdmin);
reviewAdminRoutes.patch('/:productId/:reviewId/dismiss-reports', dismissReports);
