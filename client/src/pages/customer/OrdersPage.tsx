import { Package } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useGetMyOrdersQuery } from '@/redux/api/ordersApi';
import type { OrderStatus } from '@/types/order';
import { cldUrl } from '@/utils/cloudinaryImage';
import { formatCurrency } from '@/utils/formatCurrency';

const FILTERS: Array<{ label: string; value?: OrderStatus }> = [
  { label: 'All orders' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Returned', value: 'returned' },
];

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | undefined>(undefined);
  const { data, isLoading, isFetching } = useGetMyOrdersQuery({ status: activeFilter });
  const orders = data?.data?.orders ?? [];

  return (
    <>
      <Helmet>
        <title>My orders | SnackCo</title>
      </Helmet>
      <Breadcrumbs items={[{ label: 'My orders' }]} />
      <section className="container py-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black">My orders</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Track deliveries, manage returns, and download invoices.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border/70 bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your orders…</p>
          ) : orders.length ? (
            orders.map((order) => (
              <Link
                key={order._id}
                to={ROUTES.orderDetail(order._id)}
                className="block rounded-3xl border border-border/70 bg-card p-5 shadow-sm transition hover:border-primary/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">Order #{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex -space-x-3">
                    {order.items.slice(0, 4).map((item, index) => (
                      <img
                        key={`${item.name}-${index}`}
                        src={cldUrl(item.image, 'avatar')}
                        alt={item.name}
                        loading="lazy"
                        className="h-12 w-12 rounded-xl border-2 border-card object-cover"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} item{order.items.length === 1 ? '' : 's'} •{' '}
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed bg-card p-10 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-lg font-semibold">No orders yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your snack orders will show up here once you place one.
              </p>
              <Button asChild className="mt-6">
                <Link to={ROUTES.products}>Browse snacks</Link>
              </Button>
            </div>
          )}
          {isFetching && !isLoading && (
            <p className="text-center text-xs text-muted-foreground">Refreshing…</p>
          )}
        </div>
      </section>
    </>
  );
}
