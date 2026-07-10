import { baseApi } from '@/redux/api/baseApi';
import type { Review, ReviewsResponse } from '@/types/review';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type ReviewPayload = {
  rating: number;
  title: string;
  comment: string;
  images?: { url: string; publicId: string }[];
};

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<
      ApiResponse<ReviewsResponse>,
      { productId: string; page?: number; sort?: 'recent' | 'helpful'; rating?: number }
    >({
      query: ({ productId, page, sort, rating }) => ({
        url: `/products/${productId}/reviews`,
        params: {
          ...(page ? { page } : {}),
          ...(sort ? { sort } : {}),
          ...(rating ? { rating } : {}),
        },
      }),
      providesTags: (_result, _error, { productId }) => [{ type: 'Review' as const, id: productId }],
    }),
    createReview: builder.mutation<ApiResponse<{ review: Review }>, { productId: string } & ReviewPayload>({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}/reviews`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Review' as const, id: productId }],
    }),
    updateReview: builder.mutation<
      ApiResponse<{ review: Review }>,
      { productId: string; reviewId: string } & Partial<ReviewPayload>
    >({
      query: ({ productId, reviewId, ...body }) => ({
        url: `/products/${productId}/reviews/${reviewId}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Review' as const, id: productId }],
    }),
    deleteReview: builder.mutation<ApiResponse<null>, { productId: string; reviewId: string }>({
      query: ({ productId, reviewId }) => ({
        url: `/products/${productId}/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'Review' as const, id: productId },
        { type: 'Review' as const, id: 'ADMIN_LIST' },
      ],
    }),
    toggleHelpfulVote: builder.mutation<
      ApiResponse<{ helpfulCount: number; hasVoted: boolean }>,
      { productId: string; reviewId: string }
    >({
      query: ({ productId, reviewId }) => ({
        url: `/products/${productId}/reviews/${reviewId}/helpful`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { productId }) => [{ type: 'Review' as const, id: productId }],
    }),
    moderateReview: builder.mutation<
      ApiResponse<{ review: Review }>,
      { productId: string; reviewId: string; status: 'approved' | 'rejected' }
    >({
      query: ({ productId, reviewId, status }) => ({
        url: `/products/${productId}/reviews/${reviewId}/moderate`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: 'Review' as const, id: productId },
        { type: 'Review' as const, id: 'ADMIN_LIST' },
      ],
    }),
    reportReview: builder.mutation<ApiResponse<null>, { productId: string; reviewId: string; reason: string }>({
      query: ({ productId, reviewId, reason }) => ({
        url: `/products/${productId}/reviews/${reviewId}/report`,
        method: 'POST',
        body: { reason },
      }),
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useToggleHelpfulVoteMutation,
  useModerateReviewMutation,
  useReportReviewMutation,
} = reviewsApi;
