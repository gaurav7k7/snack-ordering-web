import { baseApi } from '@/redux/api/baseApi';
import type { ApiProduct, SearchProduct } from '@/types/product';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type SearchResponse = ApiResponse<{
  products: SearchProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>;

type SuggestionsResponse = ApiResponse<{ suggestions: string[]; popularSearches: string[] }>;
type ProductResponse = ApiResponse<{ product: ApiProduct }>;

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchProducts: builder.query<SearchResponse, Record<string, string>>({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/products?${queryString}`;
      },
      providesTags: ['Products'],
    }),
    searchSuggestions: builder.query<SuggestionsResponse, string>({
      query: (q) => `/products/suggestions?q=${encodeURIComponent(q)}`,
      providesTags: ['Suggestions'],
    }),
    getProductBySlug: builder.query<ProductResponse, string>({
      query: (slug) => `/products/${slug}`,
      providesTags: (_result, _error, slug) => [{ type: 'Products' as const, id: slug }],
    }),
  }),
});

export const { useSearchProductsQuery, useSearchSuggestionsQuery, useGetProductBySlugQuery } =
  productsApi;
