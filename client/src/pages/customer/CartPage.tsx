import { ArrowRight, Minus, Plus, Sparkles, Trash2, Heart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import {
  moveBackToCart,
  moveToSaved,
  removeItem,
  removeSavedItem,
  setCouponCode,
  setGiftCouponCode,
  updateQuantity,
} from '@/redux/slices/cartSlice';
import { formatCurrency } from '@/utils/formatCurrency';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, savedItems, couponCode, giftCouponCode } = useAppSelector((state) => state.cart);

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const couponDiscount = couponCode.trim().toLowerCase() === 'snack10' ? subtotal * 0.1 : 0;
  const giftDiscount =
    giftCouponCode.trim().toLowerCase() === 'gift50' ? Math.min(subtotal * 0.05, 100) : 0;
  const tax = Math.round(Math.max(subtotal - couponDiscount - giftDiscount, 0) * 0.18);
  const deliveryCharges = subtotal > 999 ? 0 : 69;
  const total = subtotal - couponDiscount - giftDiscount + tax + deliveryCharges;

  return (
    <>
      <Helmet>
        <title>Your Cart | SnackCo</title>
      </Helmet>
      <Breadcrumbs items={[{ label: 'Cart' }]} />
      <section className="container py-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black">Your cart</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review your order, save favorites for later, and apply coupons before checkout.
            </p>
          </div>
          <Link to={ROUTES.products} className="text-sm font-semibold text-primary hover:underline">
            Continue shopping
          </Link>
        </div>

        {items.length === 0 && savedItems.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed bg-card p-10 text-center">
            <p className="text-lg font-semibold">Your cart is empty.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Add some premium snacks and come back here for a fast checkout.
            </p>
            <Button asChild className="mt-6">
              <Link to={ROUTES.products}>Browse snacks</Link>
            </Button>
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            {items.length ? (
              <div className="rounded-3xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Cart items</h2>
                  <p className="text-sm text-muted-foreground">{items.length} item(s)</p>
                </div>
                <div className="mt-5 space-y-4">
                  {items.map((item) => (
                    <article
                      key={item.productId}
                      className="grid gap-4 rounded-2xl border bg-background p-4 md:grid-cols-[96px_1fr_auto]"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-24 w-full rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatCurrency(item.price)}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <div className="inline-flex items-center rounded-md border">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Decrease quantity"
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    productId: item.productId,
                                    quantity: item.quantity - 1,
                                  }),
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label="Increase quantity"
                              onClick={() =>
                                dispatch(
                                  updateQuantity({
                                    productId: item.productId,
                                    quantity: item.quantity + 1,
                                  }),
                                )
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dispatch(moveToSaved(item.productId))}
                          >
                            <Heart className="mr-2 h-4 w-4" /> Save for later
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => dispatch(removeItem(item.productId))}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                          </Button>
                        </div>
                      </div>
                      <div className="text-right text-sm font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {savedItems.length ? (
              <div className="rounded-3xl border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black">Saved for later</h2>
                  <p className="text-sm text-muted-foreground">{savedItems.length} item(s)</p>
                </div>
                <div className="mt-5 space-y-4">
                  {savedItems.map((item) => (
                    <div
                      key={item.productId}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background p-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-14 w-14 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => dispatch(moveBackToCart(item.productId))}
                        >
                          Move to cart
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dispatch(removeSavedItem(item.productId))}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black">Price summary</h2>
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Coupon savings</span>
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
                  <span>Delivery charges</span>
                  <span>{deliveryCharges === 0 ? 'Free' : formatCurrency(deliveryCharges)}</span>
                </div>
              </div>
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Order total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <Button asChild className="mt-5 w-full" size="lg">
                  <Link to={ROUTES.checkout}>
                    Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-5 shadow-sm">
              <h2 className="text-xl font-black">Coupon code</h2>
              <input
                value={couponCode}
                onChange={(event) => dispatch(setCouponCode(event.target.value))}
                placeholder="Enter coupon"
                className="mt-4 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
              <p className="mt-2 text-sm text-muted-foreground">Try SNACK10 for 10% off.</p>
            </div>

            <div className="rounded-3xl border bg-card p-5 shadow-sm">
              <h2 className="text-xl font-black">Gift coupon</h2>
              <input
                value={giftCouponCode}
                onChange={(event) => dispatch(setGiftCouponCode(event.target.value))}
                placeholder="Enter gift coupon"
                className="mt-4 w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Try GIFT50 for a ₹100 gift discount.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
