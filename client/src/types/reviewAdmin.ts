import type { ReviewImage } from '@/types/review';

export type ReviewReport = {
  reason: string;
  createdAt: string;
};

export type AdminReview = {
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  _id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  images: ReviewImage[];
  isVerifiedPurchase: boolean;
  status: 'approved' | 'rejected';
  helpfulCount: number;
  reportCount: number;
  reports: ReviewReport[];
  createdAt: string;
};
