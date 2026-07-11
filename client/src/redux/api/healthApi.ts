import { baseApi } from '@/redux/api/baseApi';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type HealthData = {
  service: string;
  uptime: number;
  timestamp: string;
  maintenance: boolean;
};

export const healthApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHealth: builder.query<ApiResponse<HealthData>, void>({
      query: () => '/health',
    }),
  }),
});

export const { useGetHealthQuery } = healthApi;
