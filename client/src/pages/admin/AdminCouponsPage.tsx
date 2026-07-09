import { Plus, Trash2, X, Zap } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import {
  useCreateCouponAdminMutation,
  useDeleteCouponAdminMutation,
  useListCouponsAdminQuery,
  useUpdateCouponAdminMutation,
} from '@/redux/api/couponsApi';
import type { CouponFormInput } from '@/types/coupon';
import { formatCurrency } from '@/utils/formatCurrency';

const EMPTY_FORM: CouponFormInput = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: 10,
  maxDiscountAmount: undefined,
  minOrderValue: 0,
  validFrom: new Date().toISOString().slice(0, 10),
  validUntil: new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10),
  usageLimit: undefined,
  perUserLimit: 1,
  isAutomatic: false,
  isActive: true,
};

export default function AdminCouponsPage() {
  const { data, isLoading } = useListCouponsAdminQuery();
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponAdminMutation();
  const [updateCoupon] = useUpdateCouponAdminMutation();
  const [deleteCoupon] = useDeleteCouponAdminMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CouponFormInput>(EMPTY_FORM);

  const coupons = data?.data?.coupons ?? [];

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createCoupon(form).unwrap();
      toast.success('Coupon created.');
      setForm(EMPTY_FORM);
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to create coupon.');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await updateCoupon({ id, isActive: !isActive }).unwrap();
      toast.success(isActive ? 'Coupon deactivated.' : 'Coupon activated.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to update coupon.');
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!window.confirm(`Delete coupon ${code}? This cannot be undone.`)) return;
    try {
      await deleteCoupon(id).unwrap();
      toast.success('Coupon deleted.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to delete coupon.');
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Manage Coupons | SnackCo Admin</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">Coupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {coupons.length} coupon{coupons.length === 1 ? '' : 's'} — percentage or flat discounts, automatic
            offers, and usage limits.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen((current) => !current)}>
          {isFormOpen ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {isFormOpen ? 'Cancel' : 'New coupon'}
        </Button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleCreate} className="grid gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Code</span>
            <input
              required
              value={form.code}
              onChange={(event) => setForm((f) => ({ ...f, code: event.target.value.toUpperCase() }))}
              placeholder="SNACK10"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1.5 text-sm sm:col-span-2 lg:col-span-2">
            <span className="font-semibold">Description</span>
            <input
              value={form.description}
              onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))}
              placeholder="10% off your order"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Discount type</span>
            <select
              value={form.discountType}
              onChange={(event) =>
                setForm((f) => ({ ...f, discountType: event.target.value as 'percentage' | 'flat' }))
              }
              className="h-[42px] rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="percentage">Percentage</option>
              <option value="flat">Flat amount</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Discount value</span>
            <input
              required
              type="number"
              min={1}
              value={form.discountValue}
              onChange={(event) => setForm((f) => ({ ...f, discountValue: Number(event.target.value) }))}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Max discount (optional)</span>
            <input
              type="number"
              min={0}
              value={form.maxDiscountAmount ?? ''}
              onChange={(event) =>
                setForm((f) => ({
                  ...f,
                  maxDiscountAmount: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
              placeholder="e.g. 100"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Minimum order value</span>
            <input
              type="number"
              min={0}
              value={form.minOrderValue}
              onChange={(event) => setForm((f) => ({ ...f, minOrderValue: Number(event.target.value) }))}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Valid from</span>
            <input
              required
              type="date"
              value={form.validFrom}
              onChange={(event) => setForm((f) => ({ ...f, validFrom: event.target.value }))}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Valid until</span>
            <input
              required
              type="date"
              value={form.validUntil}
              onChange={(event) => setForm((f) => ({ ...f, validUntil: event.target.value }))}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Usage limit (optional)</span>
            <input
              type="number"
              min={0}
              value={form.usageLimit ?? ''}
              onChange={(event) =>
                setForm((f) => ({ ...f, usageLimit: event.target.value ? Number(event.target.value) : undefined }))
              }
              placeholder="Unlimited"
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Per-user limit</span>
            <input
              type="number"
              min={0}
              value={form.perUserLimit}
              onChange={(event) => setForm((f) => ({ ...f, perUserLimit: Number(event.target.value) }))}
              className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
            />
            <span className="text-xs text-muted-foreground">1 = one-time coupon per customer. 0 = unlimited.</span>
          </label>
          <label className="flex items-center gap-2 self-end pb-2.5 text-sm">
            <input
              type="checkbox"
              checked={form.isAutomatic}
              onChange={(event) => setForm((f) => ({ ...f, isAutomatic: event.target.checked }))}
              className="h-4 w-4 accent-primary"
            />
            <span className="font-semibold">Apply automatically (no code needed)</span>
          </label>
          <div className="sm:col-span-2 lg:col-span-3">
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating…' : 'Create coupon'}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Discount</th>
              <th className="px-4 py-3 font-semibold">Min order</th>
              <th className="px-4 py-3 font-semibold">Usage</th>
              <th className="px-4 py-3 font-semibold">Validity</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  Loading coupons…
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No coupons yet. Create your first one above.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => (
                <tr key={coupon._id} className="border-b border-border/40 last:border-0">
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1.5 font-semibold">
                      {coupon.code}
                      {coupon.isAutomatic && <Zap className="h-3.5 w-3.5 text-primary" aria-label="Automatic offer" />}
                    </p>
                    <p className="text-xs text-muted-foreground">{coupon.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discountValue}%${coupon.maxDiscountAmount ? ` (up to ${formatCurrency(coupon.maxDiscountAmount)})` : ''}`
                      : formatCurrency(coupon.discountValue)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatCurrency(coupon.minOrderValue)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {coupon.usageCount}
                    {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''} · {coupon.perUserLimit === 1 ? 'one-time' : coupon.perUserLimit === 0 ? 'unlimited/user' : `${coupon.perUserLimit}/user`}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(coupon.validFrom).toLocaleDateString('en-IN')} –{' '}
                    {new Date(coupon.validUntil).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(coupon._id, coupon.isActive)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                        coupon.isActive
                          ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(coupon._id, coupon.code)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
