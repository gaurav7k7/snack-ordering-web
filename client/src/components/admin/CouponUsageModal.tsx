import { X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { SearchPagination } from '@/components/customer/SearchPagination';
import { ROUTES } from '@/constants/routes';
import { useGetCouponUsageAdminQuery } from '@/redux/api/couponsApi';
import { formatCurrency } from '@/utils/formatCurrency';

type CouponUsageModalProps = {
  couponId: string;
  onClose: () => void;
};

export function CouponUsageModal({ couponId, onClose }: CouponUsageModalProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetCouponUsageAdminQuery({ id: couponId, page });

  const usage = data?.data;
  const summary = usage?.summary;
  const redemptions = usage?.redemptions ?? [];
  const pagination = usage?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-border/70 bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black">Usage: {usage?.code ?? '…'}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Who redeemed this coupon and how much they saved.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Loading usage…</p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border/70 bg-background p-3">
                <p className="text-xs text-muted-foreground">Redemptions</p>
                <p className="text-xl font-black">{summary?.totalRedemptions ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background p-3">
                <p className="text-xs text-muted-foreground">Usage limit</p>
                <p className="text-xl font-black">{summary?.usageLimit ?? '∞'}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background p-3">
                <p className="text-xs text-muted-foreground">Unique customers</p>
                <p className="text-xl font-black">{summary?.uniqueCustomers ?? 0}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background p-3">
                <p className="text-xs text-muted-foreground">Total discount given</p>
                <p className="text-xl font-black">{formatCurrency(summary?.totalDiscountGiven ?? 0)}</p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto rounded-2xl border border-border/70">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-2.5 font-semibold">Customer</th>
                    <th className="px-4 py-2.5 font-semibold">Order</th>
                    <th className="px-4 py-2.5 font-semibold">Discount</th>
                    <th className="px-4 py-2.5 font-semibold">Redeemed</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                        No redemptions yet.
                      </td>
                    </tr>
                  ) : (
                    redemptions.map((redemption, index) => (
                      <tr key={index} className="border-b border-border/40 last:border-0">
                        <td className="px-4 py-2.5">
                          <p className="font-semibold">{redemption.user?.name ?? 'Guest'}</p>
                          <p className="text-xs text-muted-foreground">
                            {redemption.user?.email ?? redemption.guestEmail ?? '—'}
                          </p>
                        </td>
                        <td className="px-4 py-2.5">
                          {redemption.order ? (
                            <Link
                              to={ROUTES.adminOrderDetail(redemption.order._id)}
                              className="font-semibold text-primary hover:underline"
                            >
                              {redemption.order.orderNumber}
                            </Link>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-2.5 font-semibold">{formatCurrency(redemption.discountAmount)}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">
                          {new Date(redemption.redeemedAt).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-4">
                <SearchPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
