import { Link } from 'react-router-dom';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { ROUTES } from '@/constants/routes';
import type { OrderStatus } from '@/types/order';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

type LatestOrder = {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  guestName?: string;
  guestEmail?: string;
  createdAt: string;
};

export function LatestOrdersList({ orders }: { orders: LatestOrder[] }) {
  if (!orders.length) {
    return <p className="text-sm text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="pb-2 pr-3 font-semibold">Order</th>
            <th className="pb-2 pr-3 font-semibold">Customer</th>
            <th className="pb-2 pr-3 font-semibold">Status</th>
            <th className="pb-2 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-b border-border/40 last:border-0">
              <td className="py-2.5 pr-3">
                <Link to={ROUTES.adminOrderDetail(order._id)} className="font-semibold hover:text-primary">
                  {order.orderNumber}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {formatDate(order.createdAt, 'short')}
                </p>
              </td>
              <td className="py-2.5 pr-3 text-muted-foreground">{order.guestName ?? order.guestEmail ?? '—'}</td>
              <td className="py-2.5 pr-3">
                <OrderStatusBadge status={order.status as OrderStatus} />
              </td>
              <td className="py-2.5 text-right font-semibold">{formatCurrency(order.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
