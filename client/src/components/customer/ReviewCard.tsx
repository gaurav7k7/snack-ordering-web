import { Star } from 'lucide-react';

import type { Review } from '@/types/home';

type ReviewCardProps = {
  review: Review;
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="rounded-lg border bg-card p-5">
      <div className="mb-4 flex gap-1 text-secondary">
        {Array.from({ length: review.rating }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
        ))}
      </div>
      <p className="leading-7 text-card-foreground">"{review.quote}"</p>
      <div className="mt-5">
        <p className="font-semibold">{review.name}</p>
        <p className="text-sm text-muted-foreground">{review.role}</p>
      </div>
    </article>
  );
}
