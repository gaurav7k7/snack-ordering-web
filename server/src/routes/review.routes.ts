import { Router } from 'express';

import {
  createReview,
  deleteReview,
  listProductReviews,
  moderateReview,
  reportReview,
  toggleHelpfulVote,
  updateReview,
} from '../controllers/review.controller.js';
import { authenticate, authorize, optionalAuthenticate } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createReviewSchema,
  listReviewsQuerySchema,
  moderateReviewSchema,
  reportReviewSchema,
  updateReviewSchema,
} from '../validation/review.validation.js';

export const reviewRoutes = Router({ mergeParams: true });

reviewRoutes.get(
  '/',
  optionalAuthenticate,
  validateRequest({ query: listReviewsQuerySchema }),
  listProductReviews,
);
reviewRoutes.post('/', authenticate, validateRequest({ body: createReviewSchema }), createReview);
reviewRoutes.patch(
  '/:reviewId',
  authenticate,
  validateRequest({ body: updateReviewSchema }),
  updateReview,
);
reviewRoutes.delete('/:reviewId', authenticate, deleteReview);
reviewRoutes.post('/:reviewId/helpful', authenticate, toggleHelpfulVote);
reviewRoutes.post(
  '/:reviewId/report',
  authenticate,
  validateRequest({ body: reportReviewSchema }),
  reportReview,
);
reviewRoutes.patch(
  '/:reviewId/moderate',
  authenticate,
  authorize('admin'),
  validateRequest({ body: moderateReviewSchema }),
  moderateReview,
);
