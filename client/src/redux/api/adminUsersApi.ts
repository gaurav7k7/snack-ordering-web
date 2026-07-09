import { baseApi } from '@/redux/api/baseApi';
import type { Customer, CustomerReview } from '@/types/customer';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type CustomersListResponse = ApiResponse<{
  customers: Customer[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}>;

type CustomerResponse = ApiResponse<{ customer: Customer }>;

export const adminUsersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllCustomers: builder.query<
      CustomersListResponse,
      { search?: string; status?: 'active' | 'blocked'; page?: number } | void
    >({
      query: (params) => ({
        url: '/users',
        params: {
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.page ? { page: params.page } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.customers.map((customer) => ({ type: 'User' as const, id: customer._id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),
    getCustomerById: builder.query<CustomerResponse, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'User' as const, id }],
    }),
    getCustomerReviews: builder.query<ApiResponse<{ reviews: CustomerReview[] }>, string>({
      query: (id) => `/users/${id}/reviews`,
    }),
    blockCustomer: builder.mutation<CustomerResponse, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/users/${id}/block`, method: 'PATCH', body: { reason } }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'User' as const, id },
        { type: 'User' as const, id: 'LIST' },
      ],
    }),
    unblockCustomer: builder.mutation<CustomerResponse, string>({
      query: (id) => ({ url: `/users/${id}/unblock`, method: 'PATCH' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User' as const, id },
        { type: 'User' as const, id: 'LIST' },
      ],
    }),
    deleteCustomer: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'User' as const, id },
        { type: 'User' as const, id: 'LIST' },
      ],
    }),
    resetCustomerPassword: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/users/${id}/reset-password`, method: 'POST' }),
    }),
  }),
});

export const {
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useGetCustomerReviewsQuery,
  useBlockCustomerMutation,
  useUnblockCustomerMutation,
  useDeleteCustomerMutation,
  useResetCustomerPasswordMutation,
} = adminUsersApi;
