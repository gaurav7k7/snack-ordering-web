import { baseApi } from '@/redux/api/baseApi';
import type { AdminReview } from '@/types/reviewAdmin';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type AdminReviewsListResponse = ApiResponse<{
  reviews: AdminReview[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}>;

export const reviewAdminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllReviewsForAdmin: builder.query<
      AdminReviewsListResponse,
      { status?: 'approved' | 'rejected'; reported?: boolean; rating?: number; search?: string; page?: number } | void
    >({
      query: (params) => ({
        url: '/admin/reviews',
        params: {
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.reported ? { reported: 'true' } : {}),
          ...(params?.rating ? { rating: params.rating } : {}),
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.page ? { page: params.page } : {}),
        },
      }),
      providesTags: [{ type: 'Review' as const, id: 'ADMIN_LIST' }],
    }),
    dismissReports: builder.mutation<ApiResponse<null>, { productId: string; reviewId: string }>({
      query: ({ productId, reviewId }) => ({
        url: `/admin/reviews/${productId}/${reviewId}/dismiss-reports`,
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Review' as const, id: 'ADMIN_LIST' }],
    }),
  }),
});

export const { useGetAllReviewsForAdminQuery, useDismissReportsMutation } = reviewAdminApi;
