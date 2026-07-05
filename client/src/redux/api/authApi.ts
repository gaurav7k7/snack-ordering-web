import { baseApi } from '@/redux/api/baseApi';
import type { User } from '@/types/auth';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      ApiResponse<{ user: User }>,
      { email: string; password: string; rememberMe?: boolean }
    >({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<
      ApiResponse<{ user: User }>,
      { name: string; email: string; password: string; rememberMe?: boolean }
    >({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['User'],
    }),
    getCurrentUser: builder.query<ApiResponse<{ user: User }>, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    verifyEmail: builder.mutation<ApiResponse<null>, { email: string; token: string }>({
      query: (body) => ({ url: '/auth/verify-email', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<
      ApiResponse<{ user: User }>,
      { email: string; token: string; password: string; rememberMe?: boolean }
    >({
      query: (body) => ({ url: '/auth/reset-password', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    requestOtp: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (body) => ({ url: '/auth/otp/request', method: 'POST', body }),
    }),
    verifyOtp: builder.mutation<
      ApiResponse<{ user: User }>,
      { email: string; otp: string; rememberMe?: boolean }
    >({
      query: (body) => ({ url: '/auth/otp/verify', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
} = authApi;
