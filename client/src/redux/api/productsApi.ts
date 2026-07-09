import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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

export const productsApi = createApi({
  reducerPath: 'productsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  }),
  tagTypes: ['Products', 'Suggestions'],
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
