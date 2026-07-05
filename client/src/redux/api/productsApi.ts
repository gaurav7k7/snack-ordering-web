import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { SearchProduct } from '@/types/product';

type SearchResponse = {
  products: SearchProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

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
    searchSuggestions: builder.query<{ suggestions: string[]; popularSearches: string[] }, string>({
      query: (q) => `/products/suggestions?q=${encodeURIComponent(q)}`,
      providesTags: ['Suggestions'],
    }),
  }),
});

export const { useSearchProductsQuery, useSearchSuggestionsQuery } = productsApi;
