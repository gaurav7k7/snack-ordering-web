import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cldUrl } from '@/utils/cloudinaryImage';
import { formatCurrency } from '@/utils/formatCurrency';

type FloatingAddToCartBarProps = {
  isVisible: boolean;
  name: string;
  image: string;
  price: number;
  disabled?: boolean;
  onAddToCart: () => void;
};

// Appears once the main "Add to cart" button has scrolled out of view, so
// the purchase action is always one tap away without following the user
// around the whole page.
export function FloatingAddToCartBar({
  isVisible,
  name,
  image,
  price,
  disabled,
  onAddToCart,
}: FloatingAddToCartBarProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { y: 96, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: 96, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 shadow-soft-lg backdrop-blur-xl"
        >
          <div className="container flex items-center gap-4 py-3">
            <img
              src={cldUrl(image, 'avatar')}
              alt=""
              className="hidden h-12 w-12 shrink-0 rounded-lg object-cover sm:block"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="text-base font-black">{formatCurrency(price)}</p>
            </div>
            <Button size="lg" disabled={disabled} onClick={onAddToCart}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to cart
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
