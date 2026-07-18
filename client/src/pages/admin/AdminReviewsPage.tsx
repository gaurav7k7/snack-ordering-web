import { Check, Flag, Star, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { StatusPill } from '@/components/admin/StatusPill';
import { RefreshingIndicator } from '@/components/admin/TableStateRow';
import { SearchPagination } from '@/components/shared/SearchPagination';
import { Skeleton } from '@/components/shared/Skeleton';
import { Button } from '@/components/ui/button';
import { useDeleteReviewMutation, useModerateReviewMutation } from '@/redux/api/reviewsApi';
import { useDismissReportsMutation, useGetAllReviewsForAdminQuery } from '@/redux/api/reviewAdminApi';
import { cldUrl } from '@/utils/cloudinaryImage';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatDate } from '@/utils/formatDate';

const FILTERS: Array<{ label: string; status?: 'approved' | 'rejected'; reported?: boolean }> = [
  { label: 'All' },
  { label: 'Approved', status: 'approved' },
  { label: 'Rejected', status: 'rejected' },
  { label: 'Reported', reported: true },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-secondary">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`h-3.5 w-3.5 ${index < rating ? 'fill-current' : 'text-muted-foreground/30'}`} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [activeFilter, setActiveFilter] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const filter = FILTERS[activeFilter];
  const { data, isLoading, isFetching } = useGetAllReviewsForAdminQuery({
    status: filter.status,
    reported: filter.reported,
    search,
    page,
  });

  const [moderateReview, { isLoading: isModerating }] = useModerateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();
  const [dismissReports] = useDismissReportsMutation();

  const reviews = data?.data?.reviews ?? [];
  const pagination = data?.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleModerate = async (productId: string, reviewId: string, status: 'approved' | 'rejected') => {
    try {
      await moderateReview({ productId, reviewId, status }).unwrap();
      toast.success(status === 'approved' ? 'Review approved.' : 'Review rejected.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update review.'));
    }
  };

  const handleDelete = async (productId: string, reviewId: string) => {
    if (!window.confirm('Permanently delete this review?')) return;
    try {
      await deleteReview({ productId, reviewId }).unwrap();
      toast.success('Review deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete review.'));
    }
  };

  const handleDismissReports = async (productId: string, reviewId: string) => {
    try {
      await dismissReports({ productId, reviewId }).unwrap();
      toast.success('Reports dismissed.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to dismiss reports.'));
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Reviews | Lotus Delight Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black sm:text-4xl">Review Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pagination.total} review{pagination.total === 1 ? '' : 's'} across your catalog.
        </p>
      </div>

      <AdminSearchForm
        value={searchInput}
        onChange={setSearchInput}
        onSubmit={handleSearchSubmit}
        placeholder="Search by product, reviewer, or comment…"
      />

      <div className="flex gap-2">
        {FILTERS.map((item, index) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              setActiveFilter(index);
              setPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              activeFilter === index
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/70 bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {item.reported && <Flag className="h-3 w-3" />}
            {item.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="mt-4 h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-full" />
              <Skeleton className="mt-1.5 h-3 w-5/6" />
            </div>
          ))
        ) : reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No reviews match this filter.
          </p>
        ) : (
          reviews.map((review) => (
            <article key={review._id} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {review.productImage && (
                    <img
                      src={cldUrl(review.productImage, 'avatar')}
                      alt=""
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div>
                    <Link
                      to={`/products/${review.productSlug}`}
                      target="_blank"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {review.productName}
                    </Link>
                    <div className="mt-1 flex items-center gap-2">
                      <Stars rating={review.rating} />
                      <span className="text-xs text-muted-foreground">
                        {review.name} · {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill tone={review.status === 'approved' ? 'success' : 'danger'}>
                    {review.status}
                  </StatusPill>
                  {review.reportCount > 0 && (
                    <StatusPill tone="warning">
                      <Flag className="h-3 w-3" /> {review.reportCount} report{review.reportCount === 1 ? '' : 's'}
                    </StatusPill>
                  )}
                  {review.isVerifiedPurchase && <StatusPill tone="neutral" className="bg-primary/10 text-primary">Verified</StatusPill>}
                </div>
              </div>

              <h3 className="mt-3 font-semibold">{review.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{review.comment}</p>

              {review.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.images.map((image) => (
                    <img
                      key={image.publicId}
                      src={cldUrl(image.url, 'thumbnail')}
                      alt=""
                      loading="lazy"
                      className="h-14 w-14 rounded-lg border object-cover"
                    />
                  ))}
                </div>
              )}

              {review.reports.length > 0 && (
                <div className="mt-3 space-y-1 rounded-xl bg-orange-500/5 p-3">
                  <p className="text-xs font-semibold text-orange-600">Report reasons:</p>
                  {review.reports.map((report, index) => (
                    <p key={index} className="text-xs text-muted-foreground">
                      "{report.reason}" — {formatDate(report.createdAt)}
                    </p>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {review.status !== 'approved' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isModerating}
                    onClick={() => handleModerate(review.productId, review._id, 'approved')}
                  >
                    <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
                  </Button>
                )}
                {review.status !== 'rejected' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isModerating}
                    onClick={() => handleModerate(review.productId, review._id, 'rejected')}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" /> Reject
                  </Button>
                )}
                {review.reportCount > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismissReports(review.productId, review._id)}
                  >
                    <Flag className="mr-1.5 h-3.5 w-3.5" /> Dismiss reports
                  </Button>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDelete(review.productId, review._id)}
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </article>
          ))
        )}
        {isFetching && !isLoading && <RefreshingIndicator />}
      </div>

      {pagination.totalPages > 1 && (
        <SearchPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </section>
  );
}
