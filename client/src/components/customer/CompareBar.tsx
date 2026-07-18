import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { GitCompareArrows, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/hooks/redux';
import { useCompare } from '@/hooks/useCompare';
import { useReportFloatingBarHeight } from '@/hooks/useReportFloatingBarHeight';

export function CompareBar() {
  const { productIds, count, remove, clear } = useCompare();
  const prefersReducedMotion = useReducedMotion();
  const isVisible = count > 0;
  const ref = useReportFloatingBarHeight('compareBar', isVisible);
  // Stacks above the sticky add-to-cart bar (same fixed bottom-0 slot)
  // instead of overlapping it when both happen to be visible at once.
  const addToCartBarHeight = useAppSelector((state) => state.floatingBars.heights.addToCartBar);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={ref}
          initial={prefersReducedMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          style={{ bottom: addToCartBarHeight }}
          className="fixed inset-x-0 z-40 border-t bg-background/95 shadow-soft-lg backdrop-blur-xl"
        >
          <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-2">
              <GitCompareArrows className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">
                {count} product{count === 1 ? '' : 's'} selected to compare
              </span>
              <button
                type="button"
                onClick={clear}
                className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden gap-1 sm:flex">
                {productIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => remove(id)}
                    className="grid h-6 w-6 place-items-center rounded-full bg-muted text-muted-foreground hover:text-destructive"
                    aria-label="Remove from compare"
                  >
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
              <Button asChild size="sm">
                <Link to={ROUTES.compare}>Compare now</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
