import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { removeItem, updateQuantity } from '@/redux/slices/cartSlice';
import { formatCurrency } from '@/utils/formatCurrency';

type MiniCartProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        aria-label="Close mini cart"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b p-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h2 className="text-lg font-bold">Your cart</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close cart">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            {items.length ? (
              items.map((item) => (
                <article key={item.productId} className="grid grid-cols-[84px_1fr] gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="aspect-square rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 font-semibold">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatCurrency(item.price)}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-md border">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Decrease item"
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
                          aria-label="Increase item"
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
                        size="icon"
                        aria-label="Remove item"
                        onClick={() => dispatch(removeItem(item.productId))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                Your mini cart is empty.
              </p>
            )}
          </div>
        </div>

        <div className="border-t p-5">
          <div className="mb-4 flex items-center justify-between font-semibold">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <Button asChild className="w-full" size="lg" onClick={onClose}>
            <Link to="/cart">Checkout</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
