import { baseApi } from '@/redux/api/baseApi';
import type { PartnerLogo, PartnerLogoCategory } from '@/types/partnerLogo';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type PartnerLogoImageInput = { url: string; publicId?: string; alt?: string };

type PartnerLogoInput = {
  name: string;
  logo: PartnerLogoImageInput;
  link?: string;
  category: PartnerLogoCategory;
  order?: number;
  isActive?: boolean;
};

export const partnerLogosApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerLogos: builder.query<
      ApiResponse<{ logos: PartnerLogo[] }>,
      { category?: PartnerLogoCategory; includeInactive?: boolean } | void
    >({
      query: (params) => ({
        url: '/partner-logos',
        params: {
          ...(params?.category ? { category: params.category } : {}),
          ...(params?.includeInactive ? { includeInactive: 'true' } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.logos.map((logo) => ({ type: 'PartnerLogo' as const, id: logo._id })),
              { type: 'PartnerLogo' as const, id: 'LIST' },
            ]
          : [{ type: 'PartnerLogo' as const, id: 'LIST' }],
    }),
    createPartnerLogo: builder.mutation<ApiResponse<{ logo: PartnerLogo }>, PartnerLogoInput>({
      query: (body) => ({ url: '/partner-logos', method: 'POST', body }),
      invalidatesTags: [{ type: 'PartnerLogo' as const, id: 'LIST' }],
    }),
    updatePartnerLogo: builder.mutation<
      ApiResponse<{ logo: PartnerLogo }>,
      { id: string } & Partial<PartnerLogoInput>
    >({
      query: ({ id, ...body }) => ({ url: `/partner-logos/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'PartnerLogo' as const, id },
        { type: 'PartnerLogo' as const, id: 'LIST' },
      ],
    }),
    deletePartnerLogo: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/partner-logos/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'PartnerLogo' as const, id },
        { type: 'PartnerLogo' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetPartnerLogosQuery,
  useCreatePartnerLogoMutation,
  useUpdatePartnerLogoMutation,
  useDeletePartnerLogoMutation,
} = partnerLogosApi;
