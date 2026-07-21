import { baseApi } from '@/redux/api/baseApi';
import type { Banner } from '@/types/banner';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type BannerImageInput = { url: string; publicId?: string; alt?: string };

type BannerInput = {
  heading: string;
  subheading?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  image?: BannerImageInput;
  order?: number;
  isActive?: boolean;
};

export const bannersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query<ApiResponse<{ banners: Banner[] }>, { includeInactive?: boolean } | void>({
      query: (params) => ({
        url: '/banners',
        params: params?.includeInactive ? { includeInactive: 'true' } : undefined,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.banners.map((banner) => ({ type: 'Banner' as const, id: banner._id })),
              { type: 'Banner' as const, id: 'LIST' },
            ]
          : [{ type: 'Banner' as const, id: 'LIST' }],
    }),
    createBanner: builder.mutation<ApiResponse<{ banner: Banner }>, BannerInput>({
      query: (body) => ({ url: '/banners', method: 'POST', body }),
      invalidatesTags: [{ type: 'Banner' as const, id: 'LIST' }],
    }),
    updateBanner: builder.mutation<
      ApiResponse<{ banner: Banner }>,
      { id: string } & Omit<Partial<BannerInput>, 'image'> & { image?: BannerImageInput | null }
    >({
      query: ({ id, ...body }) => ({ url: `/banners/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Banner' as const, id },
        { type: 'Banner' as const, id: 'LIST' },
      ],
    }),
    deleteBanner: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/banners/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Banner' as const, id },
        { type: 'Banner' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetBannersQuery, useCreateBannerMutation, useUpdateBannerMutation, useDeleteBannerMutation } =
  bannersApi;
