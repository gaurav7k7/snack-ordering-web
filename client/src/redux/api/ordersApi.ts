import { baseApi } from '@/redux/api/baseApi';

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data?: T;
};

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
  giftCouponCode?: string;
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
    createOrder: builder.mutation<ApiResponse<{ order: any; payment?: any }>, OrderPayload>({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
    }),
    verifyPayment: builder.mutation<ApiResponse<{ order: any }>, VerifyPaymentPayload>({
      query: (body) => ({ url: '/orders/verify-payment', method: 'POST', body }),
    }),
  }),
});

export const { useCreateOrderMutation, useVerifyPaymentMutation } = ordersApi;
