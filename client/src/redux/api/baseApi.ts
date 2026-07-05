import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { env } from '@/config/env';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: env.apiBaseUrl,
    credentials: 'include',
  }),
  tagTypes: ['Auth', 'Product', 'Cart', 'Order', 'User', 'Dashboard'],
  endpoints: () => ({}),
});
