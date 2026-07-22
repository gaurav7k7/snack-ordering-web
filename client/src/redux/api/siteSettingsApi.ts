import { baseApi } from '@/redux/api/baseApi';
import type { SiteSettings } from '@/types/siteSettings';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

export const siteSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSiteSettings: builder.query<ApiResponse<{ settings: SiteSettings }>, void>({
      query: () => ({ url: '/settings' }),
      providesTags: [{ type: 'SiteSettings' as const, id: 'SINGLETON' }],
    }),
    updateSiteSettings: builder.mutation<
      ApiResponse<{ settings: SiteSettings }>,
      Partial<Pick<SiteSettings, 'announcementText' | 'b2bClientsHeading' | 'mediaCoverageHeading'>>
    >({
      query: (body) => ({ url: '/settings', method: 'PATCH', body }),
      invalidatesTags: [{ type: 'SiteSettings' as const, id: 'SINGLETON' }],
    }),
  }),
});

export const { useGetSiteSettingsQuery, useUpdateSiteSettingsMutation } = siteSettingsApi;
