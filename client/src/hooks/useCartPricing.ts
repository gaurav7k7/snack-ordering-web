import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING_FEE } from '@/constants/pricing';
import { useGetAutomaticOfferQuery, useValidateCouponQuery } from '@/redux/api/couponsApi';

export function useCartPricing(subtotal: number, couponCode: string) {
  const trimmedCode = couponCode.trim();

  const {
    data: couponData,
    error: couponError,
    isFetching: isValidatingCoupon,
  } = useValidateCouponQuery(
    { code: trimmedCode, subtotal },
    { skip: !trimmedCode || subtotal <= 0 },
  );
  const { data: automaticData } = useGetAutomaticOfferQuery(subtotal, { skip: subtotal <= 0 });

  const appliedCoupon = couponData?.data ?? null;
  const automaticOffer = automaticData?.data?.offer ?? null;
  const couponErrorMessage = (couponError as { data?: { message?: string } } | undefined)?.data?.message;

  const couponDiscount = appliedCoupon?.discountAmount ?? 0;
  const automaticDiscount = automaticOffer?.discountAmount ?? 0;
  const totalDiscount = Math.min(couponDiscount + automaticDiscount, subtotal);
  // Product prices already include 5% GST — do not add it again on top.
  const tax = 0;
  const shippingFee = subtotal <= 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal - totalDiscount + shippingFee;

  return {
    appliedCoupon,
    couponErrorMessage: trimmedCode ? couponErrorMessage : undefined,
    isValidatingCoupon,
    automaticOffer,
    couponDiscount,
    automaticDiscount,
    tax,
    shippingFee,
    total,
  };
}
