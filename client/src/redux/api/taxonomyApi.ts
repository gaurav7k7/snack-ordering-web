import { baseApi } from '@/redux/api/baseApi';
import type { Brand, SubCategory, Tag } from '@/types/taxonomy';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type BrandLogoInput = { url: string; publicId: string };

export const taxonomyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubCategories: builder.query<
      ApiResponse<{ subCategories: SubCategory[] }>,
      { category?: string; includeInactive?: boolean } | void
    >({
      query: (params) => ({
        url: '/subcategories',
        params: {
          ...(params?.category ? { category: params.category } : {}),
          ...(params?.includeInactive ? { includeInactive: 'true' } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.subCategories.map((item) => ({ type: 'SubCategory' as const, id: item._id })),
              { type: 'SubCategory' as const, id: 'LIST' },
            ]
          : [{ type: 'SubCategory' as const, id: 'LIST' }],
    }),
    createSubCategory: builder.mutation<
      ApiResponse<{ subCategory: SubCategory }>,
      { name: string; category: string; description?: string }
    >({
      query: (body) => ({ url: '/subcategories', method: 'POST', body }),
      invalidatesTags: [{ type: 'SubCategory' as const, id: 'LIST' }],
    }),
    updateSubCategory: builder.mutation<
      ApiResponse<{ subCategory: SubCategory }>,
      { id: string; name?: string; description?: string; isActive?: boolean }
    >({
      query: ({ id, ...body }) => ({ url: `/subcategories/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'SubCategory' as const, id },
        { type: 'SubCategory' as const, id: 'LIST' },
      ],
    }),
    deleteSubCategory: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/subcategories/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'SubCategory' as const, id },
        { type: 'SubCategory' as const, id: 'LIST' },
      ],
    }),

    getBrands: builder.query<ApiResponse<{ brands: Brand[] }>, { includeInactive?: boolean } | void>({
      query: (params) => ({
        url: '/brands',
        params: params?.includeInactive ? { includeInactive: 'true' } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.brands.map((item) => ({ type: 'Brand' as const, id: item._id })),
              { type: 'Brand' as const, id: 'LIST' },
            ]
          : [{ type: 'Brand' as const, id: 'LIST' }],
    }),
    createBrand: builder.mutation<
      ApiResponse<{ brand: Brand }>,
      { name: string; description?: string; logo?: BrandLogoInput }
    >({
      query: (body) => ({ url: '/brands', method: 'POST', body }),
      invalidatesTags: [{ type: 'Brand' as const, id: 'LIST' }],
    }),
    updateBrand: builder.mutation<
      ApiResponse<{ brand: Brand }>,
      { id: string; name?: string; description?: string; isActive?: boolean; logo?: BrandLogoInput }
    >({
      query: ({ id, ...body }) => ({ url: `/brands/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Brand' as const, id },
        { type: 'Brand' as const, id: 'LIST' },
      ],
    }),
    deleteBrand: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/brands/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Brand' as const, id },
        { type: 'Brand' as const, id: 'LIST' },
      ],
    }),

    getTags: builder.query<ApiResponse<{ tags: Tag[] }>, { includeInactive?: boolean } | void>({
      query: (params) => ({
        url: '/tags',
        params: params?.includeInactive ? { includeInactive: 'true' } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.tags.map((item) => ({ type: 'Tag' as const, id: item._id })),
              { type: 'Tag' as const, id: 'LIST' },
            ]
          : [{ type: 'Tag' as const, id: 'LIST' }],
    }),
    createTag: builder.mutation<ApiResponse<{ tag: Tag }>, { name: string }>({
      query: (body) => ({ url: '/tags', method: 'POST', body }),
      invalidatesTags: [{ type: 'Tag' as const, id: 'LIST' }],
    }),
    updateTag: builder.mutation<ApiResponse<{ tag: Tag }>, { id: string; name?: string; isActive?: boolean }>({
      query: ({ id, ...body }) => ({ url: `/tags/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Tag' as const, id },
        { type: 'Tag' as const, id: 'LIST' },
      ],
    }),
    deleteTag: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/tags/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Tag' as const, id },
        { type: 'Tag' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = taxonomyApi;
