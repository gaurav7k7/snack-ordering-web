import { baseApi } from '@/redux/api/baseApi';
import type { Order } from '@/types/order';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

type OrdersListResponse = ApiResponse<{
  orders: Order[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}>;

type OrderResponse = ApiResponse<{ order: Order }>;

type OrderPayload = {
  items: Array<{
    productId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }>;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };
  deliveryInstructions?: string;
  paymentMethod?: 'cod' | 'razorpay';
  couponCode?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  isGuest?: boolean;
};

type VerifyPaymentPayload = {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<ApiResponse<{ order: Order; payment?: any }>, OrderPayload>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: ['Order'],
    }),
    verifyPayment: builder.mutation<OrderResponse, VerifyPaymentPayload>({
      query: (body) => ({ url: '/orders/verify-payment', method: 'POST', body }),
      invalidatesTags: ['Order'],
    }),
    getMyOrders: builder.query<OrdersListResponse, { page?: number; status?: string } | void>({
      query: (params) => ({
        url: '/orders',
        params: {
          ...(params?.status ? { status: params.status } : {}),
          ...(params?.page ? { page: params.page } : {}),
        },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.orders.map((order) => ({ type: 'Order' as const, id: order._id })),
              { type: 'Order' as const, id: 'LIST' },
            ]
          : [{ type: 'Order' as const, id: 'LIST' }],
    }),
    getOrderById: builder.query<OrderResponse, string>({
      query: (id) => `/orders/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Order' as const, id }],
    }),
    cancelOrder: builder.mutation<OrderResponse, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/orders/${id}/cancel`, method: 'POST', body: { reason } }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Order' as const, id },
        { type: 'Order' as const, id: 'LIST' },
      ],
    }),
    requestReturn: builder.mutation<OrderResponse, { id: string; reason: string }>({
      query: ({ id, reason }) => ({ url: `/orders/${id}/return`, method: 'POST', body: { reason } }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Order' as const, id },
        { type: 'Order' as const, id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useRequestReturnMutation,
} = ordersApi;
