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

export const reviewRoutes = Router({ mergeParams: true });

reviewRoutes.get('/', optionalAuthenticate, listProductReviews);
reviewRoutes.post('/', authenticate, createReview);
reviewRoutes.patch('/:reviewId', authenticate, updateReview);
reviewRoutes.delete('/:reviewId', authenticate, deleteReview);
reviewRoutes.post('/:reviewId/helpful', authenticate, toggleHelpfulVote);
reviewRoutes.post('/:reviewId/report', authenticate, reportReview);
reviewRoutes.patch('/:reviewId/moderate', authenticate, authorize('admin'), moderateReview);
