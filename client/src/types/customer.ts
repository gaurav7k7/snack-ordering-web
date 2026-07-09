export type Customer = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  blockedAt?: string;
  blockedReason?: string;
  createdAt: string;
};

export type CustomerReview = {
  _id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  rating: number;
  title: string;
  comment: string;
  status: 'approved' | 'rejected';
  createdAt: string;
};
