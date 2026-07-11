import { baseApi } from '@/redux/api/baseApi';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const newsletterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    subscribeToNewsletter: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (body) => ({ url: '/newsletter/subscribe', method: 'POST', body }),
    }),
  }),
});

export const { useSubscribeToNewsletterMutation } = newsletterApi;
