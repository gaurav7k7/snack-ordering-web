import { Ban, Download, Eye, RefreshCcw, ShoppingBag, Truck, User } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';

import { AssignDeliveryCard } from '@/components/admin/AssignDeliveryCard';
import { RefundModal } from '@/components/admin/RefundModal';
import { OrderStatusBadge, STATUS_LABELS } from '@/components/orders/OrderStatusBadge';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { ReasonModal } from '@/components/orders/ReasonModal';
import { PageLoader } from '@/components/shared/PageLoader';
import { Button } from '@/components/ui/button';
import { env } from '@/config/env';
import { ROUTES } from '@/constants/routes';
import {
  useAdminCancelOrderMutation,
  useGetOrderByIdForAdminQuery,
  useRefundOrderMutation,
  useUpdateOrderStatusMutation,
} from '@/redux/api/ordersApi';
import { CANCELLABLE_ORDER_STATUSES, type OrderStatus } from '@/types/order';
import { cldUrl } from '@/utils/cloudinaryImage';
import { formatCurrency } from '@/utils/formatCurrency';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatDate } from '@/utils/formatDate';

const ALL_STATUSES = Object.keys(STATUS_LABELS) as OrderStatus[];

const CANCEL_REASONS = [
  'Customer requested cancellation',
  'Item out of stock',
  'Duplicate order',
  'Suspected fraud',
];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeModal, setActiveModal] = useState<'cancel' | 'refund' | null>(null);

  const { data, isLoading } = useGetOrderByIdForAdminQuery(id ?? '', { skip: !id });
  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateOrderStatusMutation();
  const [adminCancelOrder, { isLoading: isCancelling }] = useAdminCancelOrderMutation();
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();

  const order = data?.data?.order;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!order || !id) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        <p className="text-lg font-semibold">We couldn't find that order.</p>
        <Button asChild className="mt-6">
          <Link to={ROUTES.adminOrders}>Back to orders</Link>
        </Button>
      </div>
    );
  }

  const isCancellable = CANCELLABLE_ORDER_STATUSES.includes(order.status);
  const isRefundable = order.payment?.status === 'paid' && order.status !== 'refunded';
  const invoiceUrl = `${env.apiBaseUrl}/orders/admin/${order._id}/invoice`;
  const customer = typeof order.user === 'object' ? order.user : undefined;

  const handleStatusChange = async (status: string) => {
    try {
      await updateStatus({ id: order._id, status }).unwrap();
      toast.success('Order status updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update order status.'));
    }
  };

  const handleCancel = async (reason: string) => {
    try {
      await adminCancelOrder({ id: order._id, reason }).unwrap();
      toast.success('Order cancelled.');
      setActiveModal(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to cancel this order.'));
    }
  };

  const handleRefund = async ({ amount, reason }: { amount: number; reason: string }) => {
    try {
      await refundOrder({ id: order._id, amount, reason }).unwrap();
      toast.success('Refund processed.');
      setActiveModal(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to process refund.'));
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Order #{order.orderNumber} | SnackCo Admin</title>
      </Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to={ROUTES.adminOrders} className="text-sm text-muted-foreground hover:text-foreground">
            ← All orders
          </Link>
          <h1 className="mt-1 text-3xl font-black">Order #{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on {formatDate(order.createdAt, 'datetime')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} className="text-sm" />
          <select
            value={order.status}
            disabled={isUpdatingStatus}
            onChange={(event) => handleStatusChange(event.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary"
          >
            {ALL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Customer details</h2>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-semibold">{order.guestName ?? customer?.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-semibold">{order.guestEmail ?? customer?.email ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-semibold">{order.guestPhone ?? customer?.phone ?? '—'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Account</p>
                <p className="font-semibold">{customer ? 'Registered customer' : 'Guest checkout'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Order timeline</h2>
            </div>
            <div className="mt-6">
              <OrderTimeline order={order} />
            </div>
            {order.cancellation?.reason && (
              <p className="mt-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                Cancellation reason: {order.cancellation.reason}
              </p>
            )}
            {order.returnRequest?.reason && (
              <p className="mt-2 rounded-xl bg-orange-500/10 p-3 text-sm text-orange-600">
                Return reason: {order.returnRequest.reason} ({order.returnRequest.status ?? 'pending'} review)
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Items</h2>
            </div>
            <div className="mt-5 space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={`${item.product}-${index}`}
                  className="flex items-center gap-4 rounded-2xl border border-border/70 bg-background p-4"
                >
                  <img src={cldUrl(item.image, 'thumbnail')} alt={item.name} loading="lazy" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty {item.quantity} × {formatCurrency(item.price)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <h2 className="text-xl font-black">Delivery address</h2>
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>
                {[
                  order.shippingAddress?.line1,
                  order.shippingAddress?.line2,
                  order.shippingAddress?.city,
                  order.shippingAddress?.state,
                  order.shippingAddress?.postalCode,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              {order.deliveryInstructions && <p className="mt-2 italic">"{order.deliveryInstructions}"</p>}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <h2 className="text-xl font-black">Payment details</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-semibold capitalize">{order.payment?.provider ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-semibold capitalize">{order.payment?.status ?? 'pending'}</span>
              </div>
              {order.payment?.razorpayOrderId && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Razorpay order</span>
                  <span className="truncate font-mono text-xs">{order.payment.razorpayOrderId}</span>
                </div>
              )}
              {order.payment?.razorpayPaymentId && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Payment ID</span>
                  <span className="truncate font-mono text-xs">{order.payment.razorpayPaymentId}</span>
                </div>
              )}
              {order.payment?.refundId && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">Refund ID</span>
                  <span className="truncate font-mono text-xs">{order.payment.refundId}</span>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {(order.couponDiscount ?? 0) > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Coupon ({order.couponCode})</span>
                  <span>-{formatCurrency(order.couponDiscount ?? 0)}</span>
                </div>
              )}
              {(order.automaticDiscount ?? 0) > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Automatic offer</span>
                  <span>-{formatCurrency(order.automaticDiscount ?? 0)}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? 'Free' : formatCurrency(order.shippingFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <AssignDeliveryCard orderId={order._id} assignedDelivery={order.assignedDelivery} />

          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <h2 className="text-xl font-black">Actions</h2>
            <div className="mt-4 flex flex-col gap-3">
              <Button variant="outline" onClick={() => window.open(invoiceUrl, '_blank')}>
                <Eye className="mr-2 h-4 w-4" /> View invoice
              </Button>
              <Button variant="outline" onClick={() => window.open(`${invoiceUrl}?download=true`, '_blank')}>
                <Download className="mr-2 h-4 w-4" /> Print / download invoice
              </Button>
              {isRefundable && (
                <Button variant="outline" onClick={() => setActiveModal('refund')}>
                  <RefreshCcw className="mr-2 h-4 w-4" /> Refund order
                </Button>
              )}
              {isCancellable && (
                <Button variant="ghost" className="text-destructive" onClick={() => setActiveModal('cancel')}>
                  <Ban className="mr-2 h-4 w-4" /> Cancel order
                </Button>
              )}
            </div>
          </div>
        </aside>
      </div>

      {activeModal === 'cancel' && (
        <ReasonModal
          title="Cancel this order?"
          description="This cancels the order and, if it was paid online, automatically starts a refund."
          reasons={CANCEL_REASONS}
          confirmLabel="Cancel order"
          isSubmitting={isCancelling}
          onCancel={() => setActiveModal(null)}
          onConfirm={handleCancel}
        />
      )}
      {activeModal === 'refund' && (
        <RefundModal
          orderTotal={order.total}
          isSubmitting={isRefunding}
          onCancel={() => setActiveModal(null)}
          onConfirm={handleRefund}
        />
      )}
    </section>
  );
}
