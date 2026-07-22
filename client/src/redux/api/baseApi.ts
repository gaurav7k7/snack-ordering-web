import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { env } from '@/config/env';

function readCookie(name: string) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: env.apiBaseUrl,
    credentials: 'include',
    prepareHeaders: (headers) => {
      // Double-submit-cookie CSRF pattern: the server issues a non-httpOnly
      // csrfToken cookie, and mutating requests must echo it back as a
      // header — a cross-site request can't read this cookie to do that.
      const csrfToken = readCookie('csrfToken');
      if (csrfToken) {
        headers.set('x-csrf-token', csrfToken);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Auth',
    'Product',
    'Products',
    'Suggestions',
    'Cart',
    'Order',
    'User',
    'Dashboard',
    'Review',
    'Wishlist',
    'Coupon',
    'Category',
    'SubCategory',
    'Brand',
    'Tag',
    'Banner',
    'PartnerLogo',
    'Newsletter',
    'ContactMessage',
    'SiteSettings',
  ],
  endpoints: () => ({}),
});
