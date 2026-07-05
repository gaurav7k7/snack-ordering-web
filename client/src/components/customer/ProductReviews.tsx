import { Star } from 'lucide-react';

import type { HomeProduct } from '@/types/home';

type ProductReviewsProps = {
  product: HomeProduct;
};

export function ProductReviews({ product }: ProductReviewsProps) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold">Ratings & reviews</h2>
          <p className="text-sm text-muted-foreground">
            Average rating {product.averageRating} from {product.reviewCount} reviews.
          </p>
        </div>
        <div className="flex items-center gap-1 text-secondary">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={index < Math.round(product.averageRating) ? 'h-5 w-5 fill-current' : 'h-5 w-5'}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {product.customerReviews.map((review) => (
          <article key={review.id} className="rounded-md border bg-background p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="font-semibold">{review.title}</h3>
              <span className="text-sm font-semibold text-secondary">{review.rating}/5</span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">{review.comment}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {review.name} | {review.createdAt}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
