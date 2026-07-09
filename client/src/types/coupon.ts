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
