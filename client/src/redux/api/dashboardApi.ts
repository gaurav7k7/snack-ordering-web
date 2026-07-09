import { baseApi } from '@/redux/api/baseApi';
import type { DashboardStats } from '@/types/dashboard';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => '/dashboard',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
