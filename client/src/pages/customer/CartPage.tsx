import { ArrowRight, Minus, Plus, Sparkles, Tag, Trash2, Heart, X, Zap } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCartPricing } from '@/hooks/useCartPricing';
import {
  moveBackToCart,
  moveToSaved,
  removeItem,
  removeSavedItem,
  setCouponCode,
  updateQuantity,
} from '@/redux/slices/cartSlice';
import { cldUrl } from '@/utils/cloudinaryImage';
import { formatCurrency } from '@/utils/formatCurrency';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { items, savedItems, couponCode } = useAppSelector((state) => state.cart);
  const [couponInput, setCouponInput] = useState(couponCode);

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items],
  );
  const {
    appliedCoupon,
    couponErrorMessage,
    isValidatingCoupon,
    automaticOffer,
    couponDiscount,
    automaticDiscount,
    tax,
    shippingFee,
    total,
  } = useCartPricing(subtotal, couponCode);

  const handleApplyCoupon = (event: React.FormEvent) => {
    event.preventDefault();
    dispatch(setCouponCode(couponInput.trim()));
  };

  const handleRemoveCoupon = () => {
    setCouponInput('');
    dispatch(setCouponCode(''));
  };

  return (
    <>
      <Helmet>
        <title>Your Cart | Lotus Delight</title>
      </Helmet>
      <Breadcrumbs items={[{ label: 'Cart' }]} />
      <section className="container py-10">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">Your cart</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review your order, save favorites for later, and apply coupons before checkout.
            </p>
          </div>
          <Link to={ROUTES.products} className="text-sm font-semibold text-primary hover:underline">
            Continue shopping
          </Link>
        </div>

        {items.length === 0 && savedItems.length === 0 ? (
          <EmptyState
            className="mt-10"
            title="Your cart is empty."
            description="Add some premium snacks and come back here for a fast checkout."
            action={{ label: 'Browse snacks', to: ROUTES.products }}
          />
        ) : null}

        {automaticOffer ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
            <Zap className="h-5 w-5 shrink-0 text-primary" />
            <p>
              <span className="font-semibold">{automaticOffer.description || 'Automatic offer applied'}</span>{' '}
              — you're saving {formatCurrency(automaticOffer.discountAmount)} automatically, no code needed.
            </p>
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
                        src={cldUrl(item.image, 'thumbnail')}
                        alt={item.name}
                        loading="lazy"
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
                              className="h-10 w-10"
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
                              className="h-10 w-10"
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
                          src={cldUrl(item.image, 'thumbnail')}
                          alt={item.name}
                          loading="lazy"
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
                {couponDiscount > 0 ? (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>-{formatCurrency(couponDiscount)}</span>
                  </div>
                ) : null}
                {automaticDiscount > 0 ? (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Automatic offer</span>
                    <span>-{formatCurrency(automaticDiscount)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span>Tax</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery charges</span>
                  <span>{shippingFee === 0 ? 'Free' : formatCurrency(shippingFee)}</span>
                </div>
              </div>
              <div className="mt-5 border-t pt-4">
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Order total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <Button asChild className="mt-5 w-full" size="lg" disabled={items.length === 0}>
                  <Link to={ROUTES.checkout}>
                    Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-black">Coupon code</h2>
              </div>
              {appliedCoupon ? (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                      {appliedCoupon.code} applied
                    </p>
                    <p className="text-muted-foreground">{appliedCoupon.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    aria-label="Remove coupon"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="mt-4 flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value)}
                    placeholder="Enter coupon code"
                    className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                  />
                  <Button type="submit" variant="outline" disabled={isValidatingCoupon || !couponInput.trim()}>
                    {isValidatingCoupon ? 'Checking…' : 'Apply'}
                  </Button>
                </form>
              )}
              {couponErrorMessage ? (
                <p className="mt-2 text-sm text-destructive">{couponErrorMessage}</p>
              ) : null}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
