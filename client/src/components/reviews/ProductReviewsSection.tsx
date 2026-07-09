import { Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { RatingDistributionBar } from '@/components/reviews/RatingDistributionBar';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { ReviewListItem } from '@/components/reviews/ReviewListItem';
import { SearchPagination } from '@/components/customer/SearchPagination';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAppSelector } from '@/hooks/redux';
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useGetProductReviewsQuery,
  useToggleHelpfulVoteMutation,
  useUpdateReviewMutation,
} from '@/redux/api/reviewsApi';
import type { ReviewImage } from '@/types/review';

type ProductReviewsSectionProps = {
  productId: string;
  fallbackAverageRating: number;
  fallbackReviewCount: number;
};

export function ProductReviewsSection({
  productId,
  fallbackAverageRating,
  fallbackReviewCount,
}: ProductReviewsSectionProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<'recent' | 'helpful'>('recent');
  const [ratingFilter, setRatingFilter] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data, isLoading } = useGetProductReviewsQuery({
    productId,
    page,
    sort,
    rating: ratingFilter || undefined,
  });
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [toggleHelpfulVote] = useToggleHelpfulVoteMutation();

  const summary = data?.data;
  const reviews = summary?.reviews ?? [];
  const pagination = summary?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };
  const distribution = summary?.ratingDistribution ?? { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  const averageRating = summary?.averageRating ?? fallbackAverageRating;
  const reviewCount = summary?.reviewCount ?? fallbackReviewCount;
  const currentUserReview = summary?.currentUserReview ?? null;

  const handleSubmit = async (payload: {
    rating: number;
    title: string;
    comment: string;
    images: ReviewImage[];
  }) => {
    try {
      if (currentUserReview) {
        await updateReview({ productId, reviewId: currentUserReview._id, ...payload }).unwrap();
        toast.success('Review updated.');
      } else {
        await createReview({ productId, ...payload }).unwrap();
        toast.success('Review submitted. Thanks for the feedback!');
      }
      setIsFormOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to save your review.');
    }
  };

  const handleDelete = async () => {
    if (!currentUserReview) return;
    if (!window.confirm('Delete your review?')) return;

    try {
      await deleteReview({ productId, reviewId: currentUserReview._id }).unwrap();
      toast.success('Review deleted.');
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to delete review.');
    }
  };

  const handleToggleHelpful = async (reviewId: string) => {
    if (!isAuthenticated) {
      toast.error('Sign in to vote on reviews.');
      return;
    }
    try {
      await toggleHelpfulVote({ productId, reviewId }).unwrap();
    } catch (error: any) {
      toast.error(error?.data?.message ?? 'Unable to record your vote.');
    }
  };

  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div>
          <h2 className="text-xl font-bold">Ratings & reviews</h2>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-4xl font-black">{averageRating.toFixed(1)}</span>
            <div>
              <div className="flex items-center gap-1 text-secondary">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={index < Math.round(averageRating) ? 'h-4 w-4 fill-current' : 'h-4 w-4'}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{reviewCount} reviews</p>
            </div>
          </div>

          <div className="mt-5">
            <RatingDistributionBar
              distribution={distribution}
              reviewCount={reviewCount}
              activeRating={ratingFilter}
              onSelectRating={(rating) => {
                setRatingFilter(rating);
                setPage(1);
              }}
            />
          </div>

          {isAuthenticated ? (
            !isFormOpen && (
              <Button className="mt-5 w-full" onClick={() => setIsFormOpen(true)}>
                {currentUserReview ? 'Edit your review' : 'Write a review'}
              </Button>
            )
          ) : (
            <p className="mt-5 rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              <Link to={ROUTES.login} className="font-semibold text-primary hover:underline">
                Sign in
              </Link>{' '}
              to write a review.
            </p>
          )}
        </div>

        <div>
          {isFormOpen && (
            <div className="mb-5">
              <ReviewForm
                initialReview={currentUserReview}
                isSubmitting={isCreating || isUpdating}
                onCancel={() => setIsFormOpen(false)}
                onSubmit={handleSubmit}
              />
            </div>
          )}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {ratingFilter ? `Showing ${ratingFilter}-star reviews` : 'All reviews'}
            </p>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as 'recent' | 'helpful')}
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="recent">Most recent</option>
              <option value="helpful">Most helpful</option>
            </select>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No reviews yet. Be the first to share your experience.
            </p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewListItem
                  key={review._id}
                  review={review}
                  onEdit={review.isOwner ? () => setIsFormOpen(true) : undefined}
                  onDelete={review.isOwner ? handleDelete : undefined}
                  onToggleHelpful={
                    review.isOwner ? undefined : () => handleToggleHelpful(review._id)
                  }
                />
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <SearchPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
          )}
        </div>
      </div>
    </section>
  );
}
