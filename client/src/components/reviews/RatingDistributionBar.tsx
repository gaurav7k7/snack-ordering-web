import { Star } from 'lucide-react';

import type { RatingDistribution } from '@/types/review';

export function RatingDistributionBar({
  distribution,
  reviewCount,
  onSelectRating,
  activeRating,
}: {
  distribution: RatingDistribution;
  reviewCount: number;
  onSelectRating: (rating: number) => void;
  activeRating: number;
}) {
  return (
    <div className="space-y-2">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = distribution[String(star) as keyof RatingDistribution] ?? 0;
        const percentage = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onSelectRating(activeRating === star ? 0 : star)}
            className={`flex w-full items-center gap-2 rounded-md px-1 py-0.5 text-sm transition ${
              activeRating === star ? 'bg-primary/10' : 'hover:bg-accent'
            }`}
          >
            <span className="flex w-10 shrink-0 items-center gap-1 font-medium">
              {star} <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-secondary"
                style={{ width: `${percentage}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right text-muted-foreground">{count}</span>
          </button>
        );
      })}
    </div>
  );
}
