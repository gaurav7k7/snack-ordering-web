import { baseApi } from '@/redux/api/baseApi';
import type { User } from '@/types/auth';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type ProfileResponse = ApiResponse<{ user: User }>;
type OrdersResponse = ApiResponse<{ orders: any[] }>;
type WishlistResponse = ApiResponse<{ wishlist: any[] }>;
type WalletResponse = ApiResponse<{ wallet: { balance: number; currency: string } }>;
type NotificationsResponse = ApiResponse<{ notifications: any[] }>;
type TicketsResponse = ApiResponse<{ supportTickets: any[] }>;
type RecentlyViewedResponse = ApiResponse<{ recentlyViewed: any[] }>;
type ReviewHistoryResponse = ApiResponse<{ reviews: any[] }>;

export const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ProfileResponse, void>({
      query: () => '/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<
      ProfileResponse,
      Partial<User> & { phone?: string; avatar?: string }
    >({
      query: (body) => ({ url: '/profile', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
    uploadProfilePicture: builder.mutation<ProfileResponse, { avatar: string }>({
      query: (body) => ({ url: '/profile/avatar', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    updateAddresses: builder.mutation<ProfileResponse, { addresses: any[] }>({
      query: (body) => ({ url: '/profile/addresses', method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),
    getOrderHistory: builder.query<OrdersResponse, void>({
      query: () => '/profile/orders',
    }),
    getWishlist: builder.query<WishlistResponse, void>({
      query: () => '/profile/wishlist',
    }),
    updateWishlist: builder.mutation<WishlistResponse, { wishlist: any[] }>({
      query: (body) => ({ url: '/profile/wishlist', method: 'PUT', body }),
    }),
    getWallet: builder.query<WalletResponse, void>({
      query: () => '/profile/wallet',
    }),
    getNotifications: builder.query<NotificationsResponse, void>({
      query: () => '/profile/notifications',
    }),
    changePassword: builder.mutation<
      ApiResponse<null>,
      { currentPassword: string; newPassword: string }
    >({
      query: (body) => ({ url: '/profile/change-password', method: 'POST', body }),
    }),
    deleteAccount: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: '/profile/account', method: 'DELETE' }),
    }),
    getSupportTickets: builder.query<TicketsResponse, void>({
      query: () => '/profile/support-tickets',
    }),
    getRecentlyViewed: builder.query<RecentlyViewedResponse, void>({
      query: () => '/profile/recently-viewed',
    }),
    getReviewHistory: builder.query<ReviewHistoryResponse, void>({
      query: () => '/profile/reviews',
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfilePictureMutation,
  useUpdateAddressesMutation,
  useGetOrderHistoryQuery,
  useGetWishlistQuery,
  useUpdateWishlistMutation,
  useGetWalletQuery,
  useGetNotificationsQuery,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useGetSupportTicketsQuery,
  useGetRecentlyViewedQuery,
  useGetReviewHistoryQuery,
} = profileApi;
