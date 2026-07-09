import { ORDER_STATUS } from '../constants/orderStatus.js';
import { OrderModel } from '../models/Order.model.js';

type ReviewLike = { rating: number; status?: string };
type ProductWithReviews = {
  reviews: ReviewLike[];
  averageRating: number;
  reviewCount: number;
};

export function recalculateProductRating(product: ProductWithReviews) {
  const approved = product.reviews.filter((review) => review.status !== 'rejected');
  product.reviewCount = approved.length;
  product.averageRating = approved.length
    ? Math.round((approved.reduce((sum, review) => sum + review.rating, 0) / approved.length) * 10) / 10
    : 0;
}

export async function hasVerifiedPurchase(userId: string, productId: string) {
  const order = await OrderModel.exists({
    user: userId,
    'items.product': productId,
    status: { $ne: ORDER_STATUS.cancelled },
  });

  return Boolean(order);
}
