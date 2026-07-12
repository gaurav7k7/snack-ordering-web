import { baseApi } from '@/redux/api/baseApi';
import type { User } from '@/types/auth';
import type { CustomerReview } from '@/types/customer';
import type { Order } from '@/types/order';
import type { ApiProductCard } from '@/types/product';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type PaginationMeta = { page: number; limit: number; total: number; totalPages: number };

// Notifications/support tickets are modeled on the backend but no write
// path populates them yet — the shape below matches what the UI reads
// (message/subject) rather than a confirmed backend contract.
export type UserNotification = { message?: string; type?: string; createdAt?: string };
export type SupportTicket = { subject?: string; status?: string; createdAt?: string };

type ProfileResponse = ApiResponse<{ user: User }>;
type OrdersResponse = ApiResponse<{ orders: Order[] }>;
type WishlistResponse = ApiResponse<{ wishlist: ApiProductCard[]; pagination: PaginationMeta }>;
type WalletResponse = ApiResponse<{ wallet: { balance: number; currency: string } }>;
type NotificationsResponse = ApiResponse<{ notifications: UserNotification[] }>;
type TicketsResponse = ApiResponse<{ supportTickets: SupportTicket[] }>;
type RecentlyViewedResponse = ApiResponse<{ recentlyViewed: string[] }>;
type ReviewHistoryResponse = ApiResponse<{ reviews: CustomerReview[]; pagination: PaginationMeta }>;

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
    updateAddresses: builder.mutation<ProfileResponse, { addresses: string[] }>({
      query: (body) => ({ url: '/profile/addresses', method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),
    getOrderHistory: builder.query<OrdersResponse, void>({
      query: () => '/profile/orders',
    }),
    getWishlist: builder.query<WishlistResponse, void>({
      query: () => '/profile/wishlist',
      providesTags: ['Wishlist'],
    }),
    addToWishlist: builder.mutation<WishlistResponse, string>({
      query: (productId) => ({ url: `/profile/wishlist/${productId}`, method: 'POST' }),
      invalidatesTags: ['Wishlist'],
    }),
    removeFromWishlist: builder.mutation<WishlistResponse, string>({
      query: (productId) => ({ url: `/profile/wishlist/${productId}`, method: 'DELETE' }),
      invalidatesTags: ['Wishlist'],
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
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useGetWalletQuery,
  useGetNotificationsQuery,
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useGetSupportTicketsQuery,
  useGetRecentlyViewedQuery,
  useGetReviewHistoryQuery,
} = profileApi;
