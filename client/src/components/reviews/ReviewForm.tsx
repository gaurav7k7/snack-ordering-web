import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { ReviewImageUploader } from '@/components/reviews/ReviewImageUploader';
import { StarRatingInput } from '@/components/reviews/StarRatingInput';
import { Button } from '@/components/ui/button';
import type { Review, ReviewImage } from '@/types/review';

type ReviewFormProps = {
  initialReview?: Review | null;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (payload: { rating: number; title: string; comment: string; images: ReviewImage[] }) => void;
};

export function ReviewForm({ initialReview, isSubmitting, onCancel, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(initialReview?.rating ?? 0);
  const [title, setTitle] = useState(initialReview?.title ?? '');
  const [comment, setComment] = useState(initialReview?.comment ?? '');
  const [images, setImages] = useState<ReviewImage[]>(initialReview?.images ?? []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!rating) {
      toast.error('Please select a star rating.');
      return;
    }
    if (!title.trim() || !comment.trim()) {
      toast.error('Please add a title and a comment.');
      return;
    }

    onSubmit({ rating, title: title.trim(), comment: comment.trim(), images });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-background p-5">
      <div>
        <p className="mb-2 text-sm font-semibold">Your rating</p>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>
      <label className="grid gap-2 text-sm">
        <span className="font-semibold">Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          placeholder="Sum up your experience"
          className="rounded-xl border border-input bg-background px-4 py-3 outline-none transition focus:border-primary"
        />
      </label>
      <label className="grid gap-2 text-sm">
        <span className="font-semibold">Review</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={1000}
          rows={4}
          placeholder="What did you like or dislike?"
          className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
        />
      </label>
      <div>
        <p className="mb-2 text-sm font-semibold">Photos (optional)</p>
        <ReviewImageUploader images={images} onChange={setImages} />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : initialReview ? 'Update review' : 'Submit review'}
        </Button>
      </div>
    </form>
  );
}
