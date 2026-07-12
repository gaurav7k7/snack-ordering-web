import type { Types } from 'mongoose';

import { ORDER_STATUS } from '../constants/orderStatus.js';
import { OrderModel } from '../models/Order.model.js';

export type ReviewImage = { url: string; publicId: string };
export type ReviewReport = { user?: Types.ObjectId; reason: string; createdAt?: Date };

export type ReviewSubdoc = {
  _id: Types.ObjectId;
  user?: Types.ObjectId;
  name: string;
  rating: number;
  title: string;
  comment: string;
  images: ReviewImage[];
  isVerifiedPurchase: boolean;
  helpfulVoters: Types.ObjectId[];
  status: 'approved' | 'rejected';
  reports: ReviewReport[];
  createdAt: Date;
  updatedAt: Date;
};

// Product.reviews is a Mongoose subdocument array; the schema's inferred
// type doesn't expose the DocumentArray methods (.id()/.pull()) used by
// callers, so this is the single cast point instead of one `as any` apiece.
export function getReviewsArray(product: { reviews: unknown }): Types.DocumentArray<ReviewSubdoc> {
  return product.reviews as Types.DocumentArray<ReviewSubdoc>;
}

type ReviewLike = { rating: number; status?: string };
type ProductWithReviews = {
  reviews: ReviewLike[];
  averageRating: number;
  reviewCount: number;
};

// Reviews publish immediately (see productReviewSchema's `status` default
// of 'approved' in Product.model.ts) and moderation only *hides* a review
// after the fact — so "counted" here means "not rejected", which includes
// reviews no admin has looked at yet, not just admin-approved ones.
export function recalculateProductRating(product: ProductWithReviews) {
  const approved = product.reviews.filter((review) => review.status !== 'rejected');
  product.reviewCount = approved.length;
  product.averageRating = approved.length
    ? Math.round((approved.reduce((sum, review) => sum + review.rating, 0) / approved.length) * 10) / 10
    : 0;
}

// "Verified" means the order exists and wasn't cancelled — not that it was
// delivered or even paid. A purchase counts as verified the moment the
// order is placed, which is a deliberate leniency (COD orders are never
// "paid" in the traditional sense) rather than an oversight.
export async function hasVerifiedPurchase(userId: string, productId: string) {
  const order = await OrderModel.exists({
    user: userId,
    'items.product': productId,
    status: { $ne: ORDER_STATUS.cancelled },
  });

  return Boolean(order);
}
