import { baseApi } from '@/redux/api/baseApi';
import type { ContactMessage, ContactMessageDateRange, ContactMessageStatusFilter } from '@/types/contact';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
};

type ContactMessagesListParams = {
  search?: string;
  status?: ContactMessageStatusFilter;
  range?: ContactMessageDateRange;
  page?: number;
};

type ContactMessagesListResponse = ApiResponse<{
  messages: ContactMessage[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  totalMessages: number;
  unreadMessages: number;
}>;

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitContactMessage: builder.mutation<ApiResponse<{ contactMessage: ContactMessage }>, ContactPayload>({
      query: (body) => ({ url: '/contact', method: 'POST', body }),
    }),
    getContactMessages: builder.query<ContactMessagesListResponse, ContactMessagesListParams | void>({
      query: (params) => ({
        url: '/contact',
        params: {
          ...(params?.search ? { search: params.search } : {}),
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.range && params.range !== 'all' ? { range: params.range } : {}),
          ...(params?.page ? { page: params.page } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.messages.map((message) => ({ type: 'ContactMessage' as const, id: message._id })),
              { type: 'ContactMessage' as const, id: 'LIST' },
            ]
          : [{ type: 'ContactMessage' as const, id: 'LIST' }],
    }),
    updateContactMessageStatus: builder.mutation<
      ApiResponse<{ contactMessage: ContactMessage }>,
      { id: string; status: ContactMessageStatusFilter }
    >({
      query: ({ id, status }) => ({ url: `/contact/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ContactMessage' as const, id },
        { type: 'ContactMessage' as const, id: 'LIST' },
      ],
    }),
    deleteContactMessage: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({ url: `/contact/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'ContactMessage' as const, id: 'LIST' }],
    }),
  }),
});

export const {
  useSubmitContactMessageMutation,
  useGetContactMessagesQuery,
  useUpdateContactMessageStatusMutation,
  useDeleteContactMessageMutation,
} = contactApi;
