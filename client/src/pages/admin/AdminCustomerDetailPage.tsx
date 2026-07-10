import { Ban, CheckCircle2, KeyRound, Mail, Phone, ShoppingBag, Star, Trash2, User } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import {
  useBlockCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerByIdQuery,
  useGetCustomerReviewsQuery,
  useResetCustomerPasswordMutation,
  useUnblockCustomerMutation,
} from '@/redux/api/adminUsersApi';
import { useGetAllOrdersForAdminQuery } from '@/redux/api/ordersApi';
import { cldUrl } from '@/utils/cloudinaryImage';
import { formatCurrency } from '@/utils/formatCurrency';

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useGetCustomerByIdQuery(id ?? '', { skip: !id });
  const { data: ordersData } = useGetAllOrdersForAdminQuery(id ? { userId: id } : undefined, { skip: !id });
  const { data: reviewsData } = useGetCustomerReviewsQuery(id ?? '', { skip: !id });

  const [blockCustomer, { isLoading: isBlocking }] = useBlockCustomerMutation();
  const [unblockCustomer, { isLoading: isUnblocking }] = useUnblockCustomerMutation();
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetCustomerPasswordMutation();

  const customer = data?.data?.customer;
  const orders = ordersData?.data?.orders ?? [];
  const reviews = reviewsData?.data?.reviews ?? [];

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading customer…</p>;
  }

  if (!customer || !id) {
    return (
      <div className="rounded-2xl border border-dashed p-10 text-center">
        <p className="text-lg font-semibold">We couldn't find that customer.</p>
        <Button asChild className="mt-6">
          <Link to={ROUTES.adminCustomers}>Back to customers</Link>
        </Button>
      </div>
    );
  }

  const handleBlock = async () => {
    const reason = window.prompt(`Why are you blocking ${customer.name}? (optional)`) ?? '';
    try {
      await blockCustomer({ id: customer._id, reason }).unwrap();
      toast.success('Customer blocked.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to block customer.');
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockCustomer(customer._id).unwrap();
      toast.success('Customer unblocked.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to unblock customer.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Permanently delete ${customer.name}'s account? This cannot be undone.`)) return;
    try {
      await deleteCustomer(customer._id).unwrap();
      toast.success('Customer deleted.');
      navigate(ROUTES.adminCustomers);
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to delete customer.');
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm(`Send a password reset email to ${customer.email}?`)) return;
    try {
      await resetPassword(customer._id).unwrap();
      toast.success('Password reset email sent.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to send password reset email.');
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>{customer.name} | SnackCo Admin</title>
      </Helmet>

      <div>
        <Link to={ROUTES.adminCustomers} className="text-sm text-muted-foreground hover:text-foreground">
          ← All customers
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-xl font-black text-primary">
                {customer.avatar ? (
                  <img src={cldUrl(customer.avatar, 'avatar')} alt="" className="h-full w-full object-cover" />
                ) : (
                  customer.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black">{customer.name}</h1>
                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    customer.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                  }`}
                >
                  {customer.isActive ? 'Active' : 'Blocked'}
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
                {customer.isEmailVerified && (
                  <span className="text-xs text-emerald-600">Verified</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  Joined{' '}
                  {new Date(customer.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {!customer.isActive && customer.blockedReason && (
              <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-600">
                Blocked{customer.blockedAt ? ` on ${new Date(customer.blockedAt).toLocaleDateString('en-IN')}` : ''}:{' '}
                {customer.blockedReason}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Orders ({orders.length})</h2>
            </div>
            <div className="mt-5 space-y-3">
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders placed yet.</p>
              ) : (
                orders.map((order: any) => (
                  <Link
                    key={order._id}
                    to={ROUTES.adminOrderDetail(order._id)}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-background p-4 hover:border-primary/50"
                  >
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{formatCurrency(order.total)}</span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-black">Reviews ({reviews.length})</h2>
            </div>
            <div className="mt-5 space-y-3">
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews written yet.</p>
              ) : (
                reviews.map((review) => (
                  <Link
                    key={review._id}
                    to={`/products/${review.productSlug}`}
                    className="flex gap-4 rounded-2xl border border-border/70 bg-background p-4 hover:border-primary/50"
                  >
                    {review.productImage && (
                      <img src={cldUrl(review.productImage, 'thumbnail')} alt="" loading="lazy" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold">{review.productName}</p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                            review.status === 'approved'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          {review.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-3.5 w-3.5 ${
                              index < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-sm font-medium">{review.title}</p>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
            <h2 className="text-xl font-black">Actions</h2>
            <div className="mt-4 flex flex-col gap-3">
              {customer.isActive ? (
                <Button variant="outline" disabled={isBlocking} onClick={handleBlock}>
                  <Ban className="mr-2 h-4 w-4" /> Block customer
                </Button>
              ) : (
                <Button variant="outline" disabled={isUnblocking} onClick={handleUnblock}>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Unblock customer
                </Button>
              )}
              <Button variant="outline" disabled={isResetting} onClick={handleResetPassword}>
                <KeyRound className="mr-2 h-4 w-4" /> Send password reset
              </Button>
              <Button variant="ghost" className="text-destructive" disabled={isDeleting} onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete customer
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
