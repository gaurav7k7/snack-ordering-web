export type AppliedCoupon = {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  discountAmount: number;
};

export type AutomaticOffer = {
  code: string;
  description: string;
  discountAmount: number;
};

export type AdminCoupon = {
  _id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  perUserLimit: number;
  isAutomatic: boolean;
  isActive: boolean;
  redemptions: Array<{ user?: string; guestEmail?: string; order: string; discountAmount: number; redeemedAt: string }>;
  createdAt: string;
  updatedAt: string;
};

export type CouponUsageRedemption = {
  user: { _id: string; name: string; email: string } | null;
  guestEmail: string | null;
  order: { _id: string; orderNumber: string; total: number; status: string } | null;
  discountAmount: number;
  redeemedAt: string;
};

export type CouponUsage = {
  code: string;
  summary: {
    totalRedemptions: number;
    usageLimit: number | null;
    totalDiscountGiven: number;
    uniqueCustomers: number;
  };
  redemptions: CouponUsageRedemption[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

export type CouponFormInput = {
  code: string;
  description?: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  perUserLimit?: number;
  isAutomatic?: boolean;
  isActive?: boolean;
};
