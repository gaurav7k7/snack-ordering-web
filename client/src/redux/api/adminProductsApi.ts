import { baseApi } from '@/redux/api/baseApi';
import type { ApiProduct, ApiProductCard, ProductFormInput } from '@/types/product';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type AdminProductListResponse = ApiResponse<{
  products: ApiProductCard[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}>;

type AdminProductResponse = ApiResponse<{ product: ApiProduct }>;

export type AdminProductListParams = {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive';
  stockFilter?: 'low' | 'out';
  page?: number;
};

export type BulkImportResult = {
  created: number;
  failed: Array<{ row: number; sku?: string; error: string }>;
};

export const adminProductsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllProductsForAdmin: builder.query<AdminProductListResponse, AdminProductListParams | void>({
      query: (params) => ({
        url: '/products/admin',
        params: {
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.category ? { category: params.category } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.stockFilter ? { stockFilter: params.stockFilter } : {}),
          ...(params?.page ? { page: params.page } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.products.map((product) => ({ type: 'Product' as const, id: product._id })),
              { type: 'Product' as const, id: 'LIST' },
            ]
          : [{ type: 'Product' as const, id: 'LIST' }],
    }),
    getProductByIdForAdmin: builder.query<AdminProductResponse, string>({
      query: (id) => `/products/admin/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Product' as const, id }],
    }),
    createProduct: builder.mutation<AdminProductResponse, ProductFormInput>({
      query: (body) => ({ url: '/products', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product' as const, id: 'LIST' }, 'Dashboard'],
    }),
    updateProduct: builder.mutation<AdminProductResponse, { id: string } & Partial<ProductFormInput>>({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Product' as const, id },
        { type: 'Product' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),
    deleteProduct: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/products/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Product' as const, id },
        { type: 'Product' as const, id: 'LIST' },
        'Dashboard',
      ],
    }),
    exportProducts: builder.query<ApiResponse<{ products: ApiProduct[] }>, void>({
      query: () => '/products/admin/export',
    }),
    bulkImportProducts: builder.mutation<ApiResponse<BulkImportResult>, { products: Partial<ProductFormInput>[] }>({
      query: (body) => ({ url: '/products/admin/bulk-import', method: 'POST', body }),
      invalidatesTags: [{ type: 'Product' as const, id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const {
  useGetAllProductsForAdminQuery,
  useGetProductByIdForAdminQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useLazyExportProductsQuery,
  useBulkImportProductsMutation,
} = adminProductsApi;
