import { baseApi } from '@/redux/api/baseApi';
import type { AdminCoupon, AppliedCoupon, AutomaticOffer, CouponFormInput } from '@/types/coupon';

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
    listCouponsAdmin: builder.query<ApiResponse<{ coupons: AdminCoupon[] }>, void>({
      query: () => '/coupons',
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.coupons.map((coupon) => ({ type: 'Coupon' as const, id: coupon._id })),
              { type: 'Coupon' as const, id: 'LIST' },
            ]
          : [{ type: 'Coupon' as const, id: 'LIST' }],
    }),
    createCouponAdmin: builder.mutation<ApiResponse<{ coupon: AdminCoupon }>, CouponFormInput>({
      query: (body) => ({ url: '/coupons', method: 'POST', body }),
      invalidatesTags: [{ type: 'Coupon' as const, id: 'LIST' }],
    }),
    updateCouponAdmin: builder.mutation<
      ApiResponse<{ coupon: AdminCoupon }>,
      { id: string } & Partial<CouponFormInput>
    >({
      query: ({ id, ...body }) => ({ url: `/coupons/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Coupon' as const, id },
        { type: 'Coupon' as const, id: 'LIST' },
      ],
    }),
    deleteCouponAdmin: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/coupons/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Coupon' as const, id },
        { type: 'Coupon' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useValidateCouponQuery,
  useGetAutomaticOfferQuery,
  useListCouponsAdminQuery,
  useCreateCouponAdminMutation,
  useUpdateCouponAdminMutation,
  useDeleteCouponAdminMutation,
} = couponsApi;
