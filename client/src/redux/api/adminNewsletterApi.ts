import { baseApi } from '@/redux/api/baseApi';
import type {
  Subscriber,
  SubscriberDateRange,
  SubscriberExportFormat,
  SubscriberSortBy,
  SubscriberSortDir,
  SubscriberStatusFilter,
} from '@/types/newsletter';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type SubscribersListParams = {
  search?: string;
  status?: SubscriberStatusFilter;
  range?: SubscriberDateRange;
  sortBy?: SubscriberSortBy;
  sortDir?: SubscriberSortDir;
  page?: number;
};

type SubscribersListResponse = ApiResponse<{
  subscribers: Subscriber[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  totalSubscribers: number;
  activeSubscribers: number;
}>;

export const adminNewsletterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscribers: builder.query<SubscribersListResponse, SubscribersListParams | void>({
      query: (params) => ({
        url: '/admin/newsletter/subscribers',
        params: {
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.range && params.range !== 'all' ? { range: params.range } : {}),
          ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params?.sortDir ? { sortDir: params.sortDir } : {}),
          ...(params?.page ? { page: params.page } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.subscribers.map((subscriber) => ({ type: 'Newsletter' as const, id: subscriber._id })),
              { type: 'Newsletter' as const, id: 'LIST' },
            ]
          : [{ type: 'Newsletter' as const, id: 'LIST' }],
    }),
    deleteSubscriber: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/admin/newsletter/subscribers/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Newsletter' as const, id: 'LIST' }],
    }),
    exportSubscribers: builder.query<
      Blob,
      Omit<SubscribersListParams, 'page'> & { format: SubscriberExportFormat }
    >({
      query: (params) => ({
        url: '/admin/newsletter/subscribers/export',
        params: {
          format: params.format,
          ...(params.search ? { search: params.search } : {}),
          ...(params.status ? { status: params.status } : {}),
          ...(params.range && params.range !== 'all' ? { range: params.range } : {}),
          ...(params.sortBy ? { sortBy: params.sortBy } : {}),
          ...(params.sortDir ? { sortDir: params.sortDir } : {}),
        },
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const { useGetSubscribersQuery, useDeleteSubscriberMutation, useLazyExportSubscribersQuery } =
  adminNewsletterApi;
