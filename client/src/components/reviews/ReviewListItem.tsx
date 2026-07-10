import { BadgeCheck, Flag, Pencil, Star, ThumbsUp, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Review } from '@/types/review';
import { cn } from '@/utils/cn';

type ReviewListItemProps = {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleHelpful?: () => void;
  onReport?: () => void;
};

export function ReviewListItem({ review, onEdit, onDelete, onToggleHelpful, onReport }: ReviewListItemProps) {
  return (
    <article className={cn('rounded-2xl border bg-background p-4', review.status === 'rejected' && 'opacity-60')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1 text-secondary">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn('h-4 w-4', index < review.rating ? 'fill-current' : 'text-muted-foreground')}
              />
            ))}
          </div>
          <h3 className="mt-2 font-semibold">{review.title}</h3>
        </div>
        {review.isVerifiedPurchase && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
            <BadgeCheck className="h-3.5 w-3.5" /> Verified purchase
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.comment}</p>

      {review.images.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {review.images.map((image) => (
            <img
              key={image.publicId}
              src={image.url}
              alt=""
              className="h-16 w-16 rounded-lg border object-cover"
            />
          ))}
        </div>
      )}

      {review.status === 'rejected' && (
        <p className="mt-2 text-xs font-semibold text-destructive">
          This review was hidden by moderation and is only visible to you.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {review.name} · {new Date(review.createdAt).toLocaleDateString('en-IN')}
        </p>
        <div className="flex items-center gap-2">
          {onToggleHelpful && (
            <button
              type="button"
              onClick={onToggleHelpful}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                review.hasVoted ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent',
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({review.helpfulCount})
            </button>
          )}
          {review.isOwner && onEdit && (
            <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
            </Button>
          )}
          {review.isOwner && onDelete && (
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
            </Button>
          )}
          {!review.isOwner && onReport && (
            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={onReport}>
              <Flag className="mr-1.5 h-3.5 w-3.5" /> Report
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
