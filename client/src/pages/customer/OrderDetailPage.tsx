import { Ban, Download, Eye, RotateCcw, ShoppingBag, Truck } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { ReasonModal } from '@/components/orders/ReasonModal';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { PageLoader } from '@/components/shared/PageLoader';
import { Button } from '@/components/ui/button';
import { env } from '@/config/env';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch } from '@/hooks/redux';
import {
  useCancelOrderMutation,
  useGetOrderByIdQuery,
  useRequestReturnMutation,
} from '@/redux/api/ordersApi';
import { addItem } from '@/redux/slices/cartSlice';
import { CANCELLABLE_ORDER_STATUSES, RETURN_WINDOW_DAYS, TERMINAL_ORDER_STATUSES } from '@/types/order';
import { cldUrl } from '@/utils/cloudinaryImage';
import { formatCurrency } from '@/utils/formatCurrency';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatDate } from '@/utils/formatDate';

const CANCEL_REASONS = [
  'Ordered by mistake',
  'Found a better price elsewhere',
  'Delivery is taking too long',
  'Want to change the delivery address',
];

const RETURN_REASONS = [
  'Item was damaged or spoiled',
  'Received the wrong item',
  'Quality did not meet expectations',
  'No longer needed',
];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [activeModal, setActiveModal] = useState<'cancel' | 'return' | null>(null);

  const { data, isLoading } = useGetOrderByIdQuery(id ?? '', {
    skip: !id,
    pollingInterval: 15000,
    skipPollingIfUnfocused: true,
  });
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
  const [requestReturn, { isLoading: isRequestingReturn }] = useRequestReturnMutation();

  const order = data?.data?.order;

  if (!id) {
    return <Navigate to={ROUTES.orders} replace />;
  }

  if (isLoading) {
    return <PageLoader />;
  }

  if (!order) {
    return (
      <section className="container py-16 text-center">
        <p className="text-lg font-semibold">We couldn't find that order.</p>
        <Button asChild className="mt-6">
          <a href={ROUTES.orders}>Back to orders</a>
        </Button>
      </section>
    );
  }

  const isCancellable = CANCELLABLE_ORDER_STATUSES.includes(order.status);
  const daysSinceDelivery = order.deliveredAt
    ? (Date.now() - new Date(order.deliveredAt).getTime()) / 86_400_000
    : Infinity;
  const isReturnable = order.status === 'delivered' && daysSinceDelivery <= RETURN_WINDOW_DAYS;
  const isTerminal = TERMINAL_ORDER_STATUSES.includes(order.status);

  const invoiceUrl = `${env.apiBaseUrl}/orders/${order._id}/invoice`;

  const handleCancel = async (reason: string) => {
    try {
      await cancelOrder({ id: order._id, reason }).unwrap();
      toast.success('Order cancelled.');
      setActiveModal(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to cancel this order.'));
    }
  };

  const handleReturn = async (reason: string) => {
    try {
      await requestReturn({ id: order._id, reason }).unwrap();
      toast.success('Return request submitted.');
      setActiveModal(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to submit a return request.'));
    }
  };

  const handleReorder = () => {
    order.items.forEach((item) => {
      dispatch(
        addItem({
          productId: item.product,
          name: item.name,
          image: item.image ?? '',
          price: item.price,
          quantity: item.quantity,
        }),
      );
    });
    toast.success('Items added to your cart.');
    navigate(ROUTES.cart);
  };

  return (
    <>
      <Helmet>
        <title>Order #{order.orderNumber} | Lotus Delight</title>
      </Helmet>
      <Breadcrumbs items={[{ label: 'My orders', href: ROUTES.orders }, { label: order.orderNumber }]} />
      <section className="container py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black">Order #{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Placed on {formatDate(order.createdAt, 'datetime')}
              {!isTerminal && ' • Status updates automatically'}
            </p>
          </div>
          <OrderStatusBadge status={order.status} className="text-sm" />
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
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
                  Return reason: {order.returnRequest.reason} (
                  {order.returnRequest.status ?? 'pending'} review)
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
                    <img
                      src={cldUrl(item.image, 'thumbnail')}
                      alt={item.name}
                      loading="lazy"
                      className="h-16 w-16 rounded-xl object-cover"
                    />
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
                {order.deliveryInstructions && (
                  <p className="mt-2 italic">"{order.deliveryInstructions}"</p>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
              <h2 className="text-xl font-black">Payment summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{order.shippingFee === 0 ? 'FREE Delivery' : formatCurrency(order.shippingFee)}</span>
                </div>
                {order.tax > 0 ? (
                  <div className="flex items-center justify-between">
                    <span>Tax</span>
                    <span>{formatCurrency(order.tax)}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>GST (5%)</span>
                    <span>Included in price</span>
                  </div>
                )}
              </div>
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Paid via {order.payment?.provider === 'razorpay' ? 'online payment' : 'cash on delivery'}{' '}
                  · {order.payment?.status ?? 'pending'}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
              <h2 className="text-xl font-black">Manage order</h2>
              <div className="mt-4 flex flex-col gap-3">
                <Button variant="outline" onClick={() => window.open(invoiceUrl, '_blank')}>
                  <Eye className="mr-2 h-4 w-4" /> View invoice
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open(`${invoiceUrl}?download=true`, '_blank')}
                >
                  <Download className="mr-2 h-4 w-4" /> Download invoice
                </Button>
                <Button variant="outline" onClick={handleReorder}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reorder
                </Button>
                {isCancellable && (
                  <Button variant="ghost" className="text-destructive" onClick={() => setActiveModal('cancel')}>
                    <Ban className="mr-2 h-4 w-4" /> Cancel order
                  </Button>
                )}
                {isReturnable && (
                  <Button variant="ghost" onClick={() => setActiveModal('return')}>
                    <RotateCcw className="mr-2 h-4 w-4" /> Request return
                  </Button>
                )}
                {order.status === 'delivered' && !isReturnable && (
                  <p className="text-center text-xs text-muted-foreground">
                    Return window ({RETURN_WINDOW_DAYS} days) has closed.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>

      {activeModal === 'cancel' && (
        <ReasonModal
          title="Cancel this order?"
          description="Let us know why so we can improve. If you already paid online, we'll start your refund automatically."
          reasons={CANCEL_REASONS}
          confirmLabel="Cancel order"
          isSubmitting={isCancelling}
          onCancel={() => setActiveModal(null)}
          onConfirm={handleCancel}
        />
      )}
      {activeModal === 'return' && (
        <ReasonModal
          title="Request a return"
          description="Tell us what went wrong. Our team will review your request within 24–48 hours."
          reasons={RETURN_REASONS}
          confirmLabel="Submit return request"
          isSubmitting={isRequestingReturn}
          onCancel={() => setActiveModal(null)}
          onConfirm={handleReturn}
        />
      )}
    </>
  );
}
