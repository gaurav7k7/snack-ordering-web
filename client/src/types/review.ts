export type ReviewImage = { url: string; publicId: string };

export type Review = {
  _id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  images: ReviewImage[];
  isVerifiedPurchase: boolean;
  status: 'approved' | 'rejected';
  helpfulCount: number;
  hasVoted: boolean;
  isOwner: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RatingDistribution = Record<'1' | '2' | '3' | '4' | '5', number>;

export type ReviewsResponse = {
  reviews: Review[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  ratingDistribution: RatingDistribution;
  averageRating: number;
  reviewCount: number;
  currentUserReview: Review | null;
};
