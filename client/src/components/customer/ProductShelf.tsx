import { useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ProductCard } from '@/components/customer/ProductCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import type { HomeProduct } from '@/types/home';
import type { SearchProduct } from '@/types/product';

type ProductShelfProps = {
  eyebrow: string;
  title: string;
  description: string;
  products: Array<HomeProduct | SearchProduct>;
};

// Card widths are tuned so ~5 sit in one row on laptop/desktop (xl+) and
// step down gracefully at each breakpoint, always leaving a partial card
// peeking at the edge below xl so the row visibly hints "more to scroll".
const CARD_WIDTH_CLASS =
  'w-[72%] shrink-0 snap-start sm:w-[44%] md:w-[31%] lg:w-[23.5%] xl:w-[calc((100%-4*1.25rem)/5)]';

export function ProductShelf({ eyebrow, title, description, products }: ProductShelfProps) {
  const prefersReducedMotion = useReducedMotion();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollPrev(el.scrollLeft > 8);
    setCanScrollNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, products.length]);

  const scrollByDirection = (direction: 'prev' | 'next') => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-shelf-card]');
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'next' ? step * 2 : -step * 2,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeader eyebrow={eyebrow} title={title} description={description} />
          <div className="mb-7 hidden shrink-0 gap-2 sm:flex">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              disabled={!canScrollPrev}
              onClick={() => scrollByDirection('prev')}
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              disabled={!canScrollNext}
              onClick={() => scrollByDirection('next')}
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div key={product.slug} data-shelf-card className={CARD_WIDTH_CLASS}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
