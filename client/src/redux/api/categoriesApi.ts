import { baseApi } from '@/redux/api/baseApi';
import type { Category } from '@/types/product';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<{ categories: Category[] }>, { includeInactive?: boolean } | void>({
      query: (params) => ({
        url: '/categories',
        params: params?.includeInactive ? { includeInactive: 'true' } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.categories.map((category) => ({ type: 'Category' as const, id: category._id })),
              { type: 'Category' as const, id: 'LIST' },
            ]
          : [{ type: 'Category' as const, id: 'LIST' }],
    }),
    createCategory: builder.mutation<ApiResponse<{ category: Category }>, { name: string; description?: string }>({
      query: (body) => ({ url: '/categories', method: 'POST', body }),
      invalidatesTags: [{ type: 'Category' as const, id: 'LIST' }],
    }),
    updateCategory: builder.mutation<
      ApiResponse<{ category: Category }>,
      { id: string; name?: string; description?: string; isActive?: boolean }
    >({
      query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Category' as const, id },
        { type: 'Category' as const, id: 'LIST' },
      ],
    }),
    deleteCategory: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/categories/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Category' as const, id },
        { type: 'Category' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
