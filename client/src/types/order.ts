export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export type OrderStatusHistoryEntry = {
  status: OrderStatus;
  note?: string;
  timestamp: string;
};

export type OrderItem = {
  product: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
};

export type OrderAddress = {
  fullName?: string;
  phone?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type OrderCustomer = { _id: string; name: string; email: string; phone?: string };

export type AssignedDelivery = {
  name?: string;
  phone?: string;
  notes?: string;
  assignedAt?: string;
};

export type Order = {
  _id: string;
  orderNumber: string;
  user?: string | OrderCustomer;
  items: OrderItem[];
  shippingAddress?: OrderAddress;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  deliveryInstructions?: string;
  couponCode?: string;
  couponDiscount?: number;
  automaticOfferCode?: string;
  automaticDiscount?: number;
  guestEmail?: string;
  guestName?: string;
  guestPhone?: string;
  isGuest?: boolean;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryEntry[];
  deliveredAt?: string;
  cancellation?: { reason?: string; cancelledAt?: string };
  returnRequest?: {
    reason?: string;
    requestedAt?: string;
    status?: 'pending' | 'approved' | 'rejected';
    resolvedAt?: string;
  };
  assignedDelivery?: AssignedDelivery;
  payment: {
    provider?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    status?: string;
    refundId?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export const TERMINAL_ORDER_STATUSES: OrderStatus[] = [
  'delivered',
  'cancelled',
  'returned',
  'refunded',
];

export const CANCELLABLE_ORDER_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'packed'];

export const RETURN_WINDOW_DAYS = 7;
