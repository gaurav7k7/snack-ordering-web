import { CheckCircle2, CreditCard, MapPin, PackageCheck, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCreateOrderMutation } from '@/redux/api/ordersApi';
import { clearCart } from '@/redux/slices/cartSlice';
import { formatCurrency } from '@/utils/formatCurrency';

const defaultAddress = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, couponCode, giftCouponCode } = useAppSelector((state) => state.cart);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [address, setAddress] = useState(defaultAddress);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [isGuest, setIsGuest] = useState(!isAuthenticated);
  const [guestEmail, setGuestEmail] = useState('');

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );
  const couponDiscount = couponCode.trim().toLowerCase() === 'snack10' ? subtotal * 0.1 : 0;
  const giftDiscount =
    giftCouponCode.trim().toLowerCase() === 'gift50' ? Math.min(subtotal * 0.05, 100) : 0;
  const tax = Math.round(Math.max(subtotal - couponDiscount - giftDiscount, 0) * 0.18);
  const deliveryCharges = subtotal > 999 ? 0 : 69;
  const total = subtotal - couponDiscount - giftDiscount + tax + deliveryCharges;

  if (!items.length) {
    return <Navigate to={ROUTES.cart} replace />;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (
      !address.fullName ||
      !address.phone ||
      !address.line1 ||
      !address.city ||
      !address.state ||
      !address.postalCode
    ) {
      toast.error('Please complete the delivery address.');
      return;
    }

    if (!isAuthenticated && !guestEmail.trim()) {
      toast.error('Please enter your email for guest checkout.');
      return;
    }

    try {
      const result = await createOrder({
        items,
        shippingAddress: address,
        deliveryInstructions,
        paymentMethod,
        couponCode,
        giftCouponCode,
        guestName: isAuthenticated ? user?.name : address.fullName,
        guestEmail: isAuthenticated ? user?.email : guestEmail,
        guestPhone: address.phone,
        isGuest: !isAuthenticated,
      }).unwrap();

      dispatch(clearCart());
      toast.success('Order placed successfully.');
      navigate('/order-confirmation', { state: { order: result.data?.order } });
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to place your order.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Checkout | SnackCo</title>
      </Helmet>
      <Breadcrumbs items={[{ label: 'Cart', href: ROUTES.cart }, { label: 'Checkout' }]} />
      <section className="container py-10">
        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-3xl font-black">Checkout</h1>
          <p className="text-sm text-muted-foreground">
            Choose how you want to receive your order and pay securely.
          </p>
        </div>

        <form className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]" onSubmit={handleSubmit}>
          <div className="space-y-6">
            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black">1. Customer mode</h2>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant={isGuest ? 'default' : 'outline'}
                  onClick={() => setIsGuest(true)}
                >
                  Guest checkout
                </Button>
                <Button
                  type="button"
                  variant={!isGuest ? 'default' : 'outline'}
                  onClick={() => setIsGuest(false)}
                  disabled={isAuthenticated}
                >
                  Login checkout
                </Button>
              </div>
              {!isAuthenticated && isGuest ? (
                <input
                  value={guestEmail}
                  onChange={(event) => setGuestEmail(event.target.value)}
                  className="mt-4 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  placeholder="Email for order confirmation"
                  type="email"
                />
              ) : null}
            </section>

            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black">2. Delivery address</h2>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  value={address.fullName}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, fullName: event.target.value }))
                  }
                  className="rounded-xl border bg-background px-4 py-3 text-sm"
                  placeholder="Full name"
                />
                <input
                  value={address.phone}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="rounded-xl border bg-background px-4 py-3 text-sm"
                  placeholder="Phone number"
                />
                <input
                  value={address.line1}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, line1: event.target.value }))
                  }
                  className="rounded-xl border bg-background px-4 py-3 text-sm md:col-span-2"
                  placeholder="Address line 1"
                />
                <input
                  value={address.line2}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, line2: event.target.value }))
                  }
                  className="rounded-xl border bg-background px-4 py-3 text-sm md:col-span-2"
                  placeholder="Address line 2 (optional)"
                />
                <input
                  value={address.city}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, city: event.target.value }))
                  }
                  className="rounded-xl border bg-background px-4 py-3 text-sm"
                  placeholder="City"
                />
                <input
                  value={address.state}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, state: event.target.value }))
                  }
                  className="rounded-xl border bg-background px-4 py-3 text-sm"
                  placeholder="State"
                />
                <input
                  value={address.postalCode}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, postalCode: event.target.value }))
                  }
                  className="rounded-xl border bg-background px-4 py-3 text-sm"
                  placeholder="Postal code"
                />
                <input
                  value={address.country}
                  onChange={(event) =>
                    setAddress((current) => ({ ...current, country: event.target.value }))
                  }
                  className="rounded-xl border bg-background px-4 py-3 text-sm"
                  placeholder="Country"
                />
              </div>
            </section>

            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black">3. Delivery instructions</h2>
              </div>
              <textarea
                value={deliveryInstructions}
                onChange={(event) => setDeliveryInstructions(event.target.value)}
                className="mt-4 min-h-24 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                placeholder="Leave a note for the rider, gate code, or delivery preferences."
              />
            </section>

            <section className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black">4. Payment method</h2>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`rounded-2xl border p-4 text-left ${paymentMethod === 'cod' ? 'border-primary bg-primary/10' : 'bg-background'}`}
                >
                  <p className="font-semibold">Cash on delivery</p>
                  <p className="mt-1 text-sm text-muted-foreground">Pay when the order arrives.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`rounded-2xl border p-4 text-left ${paymentMethod === 'razorpay' ? 'border-primary bg-primary/10' : 'bg-background'}`}
                >
                  <p className="font-semibold">Razorpay</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Secure online payment gateway.
                  </p>
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-black">Order summary</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Coupon</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Gift coupon</span>
                  <span>-{formatCurrency(giftDiscount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span>{deliveryCharges === 0 ? 'Free' : formatCurrency(deliveryCharges)}</span>
                </div>
              </div>
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <Button type="submit" className="mt-5 w-full" size="lg" disabled={isLoading}>
                  {isLoading ? 'Placing order…' : 'Place order'}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  You will receive an email confirmation once your order is placed.
                </p>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black">What you get</h2>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li>• Fresh packing and safe delivery</li>
                <li>• Order tracking after confirmation</li>
                <li>• Invoice and email confirmation</li>
              </ul>
            </div>
          </aside>
        </form>
      </section>
    </>
  );
}
