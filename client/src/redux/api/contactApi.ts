import { baseApi } from '@/redux/api/baseApi';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitContactMessage: builder.mutation<ApiResponse<null>, ContactPayload>({
      query: (body) => ({ url: '/contact', method: 'POST', body }),
    }),
  }),
});

export const { useSubmitContactMessageMutation } = contactApi;
