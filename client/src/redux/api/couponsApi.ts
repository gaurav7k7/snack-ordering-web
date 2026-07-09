import { baseApi } from '@/redux/api/baseApi';
import type { AppliedCoupon, AutomaticOffer } from '@/types/coupon';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const couponsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // A query (not a mutation): re-validates automatically whenever the code or
    // subtotal change, so the cart/checkout price summary always reflects the
    // latest server-side truth without a manual "refresh" step.
    validateCoupon: builder.query<ApiResponse<AppliedCoupon>, { code: string; subtotal: number }>({
      query: (body) => ({ url: '/coupons/validate', method: 'POST', body }),
    }),
    getAutomaticOffer: builder.query<ApiResponse<{ offer: AutomaticOffer | null }>, number>({
      query: (subtotal) => ({ url: '/coupons/automatic', params: { subtotal } }),
    }),
  }),
});

export const { useValidateCouponQuery, useGetAutomaticOfferQuery } = couponsApi;
