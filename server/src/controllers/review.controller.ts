import { StatusCodes } from 'http-status-codes';

import { ProductModel } from '../models/Product.model.js';
import { UserModel } from '../models/User.model.js';
import {
  getReviewsArray,
  hasVerifiedPurchase,
  recalculateProductRating,
  type ReviewSubdoc,
} from '../services/review.service.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';

const REVIEWS_PER_PAGE = 10;

function mapReview(review: ReviewSubdoc, requesterId?: string) {
  const voters = review.helpfulVoters ?? [];

  return {
    _id: review._id,
    name: review.name,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    images: review.images ?? [],
    isVerifiedPurchase: review.isVerifiedPurchase,
    status: review.status,
    helpfulCount: voters.length,
    hasVoted: requesterId ? voters.some((id) => id?.toString() === requesterId) : false,
    isOwner: requesterId ? review.user?.toString() === requesterId : false,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

export const listProductReviews = asyncHandler(async (req, res) => {
  const product = await ProductModel.findById(req.params.productId).select('reviews').lean();

  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  const requesterId = req.user?.userId;
  const isAdmin = req.user?.role === 'admin';
  const allReviews = (product.reviews ?? []) as unknown as ReviewSubdoc[];

  const visibleReviews = allReviews.filter(
    (review) => review.status !== 'rejected' || isAdmin || review.user?.toString() === requesterId,
  );

  const approvedForStats = allReviews.filter((review) => review.status !== 'rejected');
  const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  approvedForStats.forEach((review) => {
    ratingDistribution[review.rating] = (ratingDistribution[review.rating] ?? 0) + 1;
  });
  const averageRating = approvedForStats.length
    ? Math.round(
        (approvedForStats.reduce((sum, review) => sum + review.rating, 0) / approvedForStats.length) * 10,
      ) / 10
    : 0;

  const sort = req.query.sort === 'helpful' ? 'helpful' : 'recent';
  const ratingFilter = Number(req.query.rating) || 0;
  const page = Math.max(Number(req.query.page) || 1, 1);

  const filtered = ratingFilter
    ? visibleReviews.filter((review) => review.rating === ratingFilter)
    : visibleReviews;

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'helpful') {
      return (b.helpfulVoters?.length ?? 0) - (a.helpfulVoters?.length ?? 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const total = sorted.length;
  const paged = sorted.slice((page - 1) * REVIEWS_PER_PAGE, page * REVIEWS_PER_PAGE);
  const currentUserReview = requesterId
    ? allReviews.find((review) => review.user?.toString() === requesterId)
    : undefined;

  res.status(StatusCodes.OK).json(
    createApiResponse('Reviews retrieved.', {
      reviews: paged.map((review) => mapReview(review, requesterId)),
      pagination: {
        page,
        limit: REVIEWS_PER_PAGE,
        total,
        totalPages: Math.max(Math.ceil(total / REVIEWS_PER_PAGE), 1),
      },
      ratingDistribution,
      averageRating,
      reviewCount: approvedForStats.length,
      currentUserReview: currentUserReview ? mapReview(currentUserReview, requesterId) : null,
    }),
  );
});

export const createReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError('Authentication required.', StatusCodes.UNAUTHORIZED);
  }

  const { rating, title, comment, images } = req.body;

  const product = await ProductModel.findById(req.params.productId);
  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  const reviews = getReviewsArray(product);
  const alreadyReviewed = reviews.some((review) => review.user?.toString() === userId);
  if (alreadyReviewed) {
    throw new AppError(
      'You have already reviewed this product. Edit your existing review instead.',
      StatusCodes.CONFLICT,
    );
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError('User not found.', StatusCodes.NOT_FOUND);
  }

  const isVerifiedPurchase = await hasVerifiedPurchase(userId, req.params.productId);

  reviews.push({
    user: userId,
    name: user.name,
    rating,
    title,
    comment,
    images: images ?? [],
    isVerifiedPurchase,
  } as never);

  recalculateProductRating(product as never);
  await product.save();

  const created = reviews[reviews.length - 1];
  res
    .status(StatusCodes.CREATED)
    .json(createApiResponse('Review submitted.', { review: mapReview(created, userId) }));
});

export const updateReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const updates = req.body;

  const product = await ProductModel.findById(req.params.productId);
  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  const review = getReviewsArray(product).id(req.params.reviewId);
  if (!review) {
    throw new AppError('Review not found.', StatusCodes.NOT_FOUND);
  }
  if (review.user?.toString() !== userId) {
    throw new AppError('You can only edit your own review.', StatusCodes.FORBIDDEN);
  }

  Object.assign(review, updates);

  recalculateProductRating(product as never);
  await product.save();

  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Review updated.', { review: mapReview(review, userId) }));
});

export const deleteReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const isAdmin = req.user?.role === 'admin';

  const product = await ProductModel.findById(req.params.productId);
  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  const reviews = getReviewsArray(product);
  const review = reviews.id(req.params.reviewId);
  if (!review) {
    throw new AppError('Review not found.', StatusCodes.NOT_FOUND);
  }
  if (review.user?.toString() !== userId && !isAdmin) {
    throw new AppError('You can only delete your own review.', StatusCodes.FORBIDDEN);
  }

  reviews.pull({ _id: req.params.reviewId });
  recalculateProductRating(product as never);
  await product.save();

  res.status(StatusCodes.OK).json(createApiResponse('Review deleted.'));
});

export const toggleHelpfulVote = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;

  const product = await ProductModel.findById(req.params.productId);
  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  const review = getReviewsArray(product).id(req.params.reviewId);
  if (!review) {
    throw new AppError('Review not found.', StatusCodes.NOT_FOUND);
  }
  if (review.user?.toString() === userId) {
    throw new AppError('You cannot vote on your own review.', StatusCodes.BAD_REQUEST);
  }

  const voters = review.helpfulVoters ?? [];
  const existingIndex = voters.findIndex((id) => id?.toString() === userId);
  const hasVoted = existingIndex < 0;

  if (hasVoted) {
    voters.push(userId as never);
  } else {
    voters.splice(existingIndex, 1);
  }
  review.helpfulVoters = voters;

  await product.save();

  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Vote recorded.', { helpfulCount: voters.length, hasVoted }));
});

export const reportReview = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const { reason } = req.body;

  const product = await ProductModel.findById(req.params.productId);
  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  const review = getReviewsArray(product).id(req.params.reviewId);
  if (!review) {
    throw new AppError('Review not found.', StatusCodes.NOT_FOUND);
  }
  if (review.user?.toString() === userId) {
    throw new AppError('You cannot report your own review.', StatusCodes.BAD_REQUEST);
  }

  const reports = review.reports ?? [];
  if (reports.some((report) => report.user?.toString() === userId)) {
    throw new AppError('You have already reported this review.', StatusCodes.CONFLICT);
  }

  reports.push({ user: userId as never, reason });
  review.reports = reports;
  await product.save();

  res.status(StatusCodes.OK).json(createApiResponse('Review reported. Our team will take a look.'));
});

export const moderateReview = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const product = await ProductModel.findById(req.params.productId);
  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  const review = getReviewsArray(product).id(req.params.reviewId);
  if (!review) {
    throw new AppError('Review not found.', StatusCodes.NOT_FOUND);
  }

  review.status = status;
  recalculateProductRating(product as never);
  await product.save();

  res
    .status(StatusCodes.OK)
    .json(createApiResponse('Review moderated.', { review: mapReview(review, req.user?.userId) }));
});
