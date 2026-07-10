import { StatusCodes } from 'http-status-codes';

import { ProductModel } from '../models/Product.model.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createApiResponse } from '../utils/apiResponse.js';
import { escapeRegex } from '../utils/escapeRegex.js';

export const listAllReviewsForAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;
  const reportedOnly = req.query.reported === 'true';
  const rating = Number(req.query.rating) || 0;
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

  const match: Record<string, unknown> = {};
  if (status === 'approved' || status === 'rejected') match['reviews.status'] = status;
  if (reportedOnly) match['reviews.reports.0'] = { $exists: true };
  if (rating) match['reviews.rating'] = rating;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    match.$or = [{ 'reviews.title': pattern }, { 'reviews.comment': pattern }, { 'reviews.name': pattern }, { name: pattern }];
  }

  const pipeline: any[] = [
    { $unwind: '$reviews' },
    ...(Object.keys(match).length ? [{ $match: match }] : []),
    { $sort: { 'reviews.createdAt': -1 } },
    {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $project: {
              _id: 0,
              productId: '$_id',
              productName: '$name',
              productSlug: '$slug',
              productImage: { $arrayElemAt: ['$images.url', 0] },
              review: '$reviews',
            },
          },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const [result] = await ProductModel.aggregate(pipeline);
  const total = result?.totalCount?.[0]?.count ?? 0;

  const reviews = (result?.data ?? []).map((row: any) => ({
    productId: row.productId,
    productName: row.productName,
    productSlug: row.productSlug,
    productImage: row.productImage,
    _id: row.review._id,
    name: row.review.name,
    rating: row.review.rating,
    title: row.review.title,
    comment: row.review.comment,
    images: row.review.images ?? [],
    isVerifiedPurchase: row.review.isVerifiedPurchase,
    status: row.review.status,
    helpfulCount: (row.review.helpfulVoters ?? []).length,
    reportCount: (row.review.reports ?? []).length,
    reports: (row.review.reports ?? []).map((report: any) => ({
      reason: report.reason,
      createdAt: report.createdAt,
    })),
    createdAt: row.review.createdAt,
  }));

  res.status(StatusCodes.OK).json(
    createApiResponse('Reviews retrieved.', {
      reviews,
      pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
    }),
  );
});

export const dismissReports = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new AppError('Product not found.', StatusCodes.NOT_FOUND);
  }

  const review = (product.reviews as any).id(reviewId);
  if (!review) {
    throw new AppError('Review not found.', StatusCodes.NOT_FOUND);
  }

  review.reports = [];
  await product.save();

  res.status(StatusCodes.OK).json(createApiResponse('Reports dismissed.'));
});
