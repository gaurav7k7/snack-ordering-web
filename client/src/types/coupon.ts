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
  redemptions: Array<{ user?: string; guestEmail?: string; order: string; redeemedAt: string }>;
  createdAt: string;
  updatedAt: string;
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
