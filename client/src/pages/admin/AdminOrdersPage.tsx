import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

import { OrderStatusBadge, STATUS_LABELS } from '@/components/orders/OrderStatusBadge';
import { SearchPagination } from '@/components/customer/SearchPagination';
import { useGetAllOrdersForAdminQuery, useUpdateOrderStatusMutation } from '@/redux/api/ordersApi';
import type { OrderStatus } from '@/types/order';
import { formatCurrency } from '@/utils/formatCurrency';

const STATUS_FILTERS: Array<{ label: string; value?: OrderStatus }> = [
  { label: 'All' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Packed', value: 'packed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Out for delivery', value: 'out_for_delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Return requested', value: 'return_requested' },
  { label: 'Returned', value: 'returned' },
  { label: 'Refunded', value: 'refunded' },
];

const ALL_STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[];

export default function AdminOrdersPage() {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetAllOrdersForAdminQuery({ status: statusFilter, page });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const orders = data?.data?.orders ?? [];
  const pagination = data?.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 };

  const handleStatusChange = async (orderId: string, status: string) => {
    setUpdatingId(orderId);
    try {
      await updateStatus({ id: orderId, status }).unwrap();
      toast.success('Order status updated.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Manage Orders | SnackCo Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pagination.total} order{pagination.total === 1 ? '' : 's'} across the store.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => {
              setStatusFilter(filter.value);
              setPage(1);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              statusFilter === filter.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/70 bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Items</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Update status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Loading orders…
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              orders.map((order: any) => (
                <tr
                  key={order._id}
                  className={`border-b border-border/40 last:border-0 ${
                    order._id === highlightId ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{order.guestName ?? order.guestEmail ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{order.items?.length ?? 0}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      disabled={isUpdating && updatingId === order._id}
                      onChange={(event) => handleStatusChange(order._id, event.target.value)}
                      className="h-9 rounded-lg border border-input bg-background px-2 text-xs outline-none focus:border-primary"
                    >
                      {ALL_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {isFetching && !isLoading && (
          <p className="border-t border-border/70 px-4 py-2 text-center text-xs text-muted-foreground">
            Refreshing…
          </p>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <SearchPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </section>
  );
}
