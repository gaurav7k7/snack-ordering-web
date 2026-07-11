import { baseApi } from '@/redux/api/baseApi';
import type { DashboardStats } from '@/types/dashboard';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<ApiResponse<DashboardStats>, { days?: 7 | 30 | 90 } | void>({
      query: (params) => ({ url: '/dashboard', params: params?.days ? { days: params.days } : undefined }),
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
