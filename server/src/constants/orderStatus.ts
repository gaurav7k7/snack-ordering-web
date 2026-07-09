export const ORDER_STATUS = {
  pending: 'pending',
  confirmed: 'confirmed',
  packed: 'packed',
  shipped: 'shipped',
  out_for_delivery: 'out_for_delivery',
  delivered: 'delivered',
  cancelled: 'cancelled',
  return_requested: 'return_requested',
  returned: 'returned',
  refunded: 'refunded',
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const CANCELLABLE_STATUSES: OrderStatus[] = [
  ORDER_STATUS.pending,
  ORDER_STATUS.confirmed,
  ORDER_STATUS.packed,
];

export const RETURN_WINDOW_DAYS = 7;
