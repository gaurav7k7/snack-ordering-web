import { ArrowDown, ArrowUp, ArrowUpDown, Download, Mail, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';

import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { StatusPill } from '@/components/admin/StatusPill';
import { RefreshingIndicator, TableStateRow } from '@/components/admin/TableStateRow';
import { TableSkeletonRows } from '@/components/admin/TableSkeletonRows';
import { SearchPagination } from '@/components/shared/SearchPagination';
import { Button } from '@/components/ui/button';
import {
  useDeleteSubscriberMutation,
  useGetSubscribersQuery,
  useLazyExportSubscribersQuery,
} from '@/redux/api/adminNewsletterApi';
import type {
  SubscriberDateRange,
  SubscriberExportFormat,
  SubscriberSortBy,
  SubscriberSortDir,
  SubscriberStatusFilter,
} from '@/types/newsletter';
import { downloadBlob } from '@/utils/csv';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatDate } from '@/utils/formatDate';

const RANGE_FILTERS: Array<{ label: string; value: SubscriberDateRange }> = [
  { label: 'All subscribers', value: 'all' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 6 months', value: '6m' },
];

const STATUS_FILTERS: Array<{ label: string; value?: SubscriberStatusFilter }> = [
  { label: 'All' },
  { label: 'Active', value: 'active' },
  { label: 'Unsubscribed', value: 'unsubscribed' },
];

const EXPORT_FORMATS: Array<{ label: string; value: SubscriberExportFormat }> = [
  { label: 'CSV', value: 'csv' },
  { label: 'Excel', value: 'xlsx' },
  { label: 'JSON', value: 'json' },
];

export default function AdminNewsletterPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [range, setRange] = useState<SubscriberDateRange>('all');
  const [status, setStatus] = useState<SubscriberStatusFilter | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SubscriberSortBy>('createdAt');
  const [sortDir, setSortDir] = useState<SubscriberSortDir>('desc');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetSubscribersQuery({
    search: search || undefined,
    status,
    range,
    sortBy,
    sortDir,
    page,
  });
  const [deleteSubscriber] = useDeleteSubscriberMutation();
  const [triggerExport, { isFetching: isExporting }] = useLazyExportSubscribersQuery();

  const subscribers = data?.data?.subscribers ?? [];
  const pagination = data?.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 };
  const totalSubscribers = data?.data?.totalSubscribers ?? 0;
  const activeSubscribers = data?.data?.activeSubscribers ?? 0;

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const toggleSort = (column: SubscriberSortBy) => {
    if (sortBy === column) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir(column === 'email' ? 'asc' : 'desc');
    }
  };

  const sortIcon = (column: SubscriberSortBy) => {
    if (sortBy !== column) return <ArrowUpDown className="h-3 w-3" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const handleDelete = async (id: string, email: string) => {
    if (!window.confirm(`Remove ${email} from your subscriber list? This cannot be undone.`)) return;
    try {
      await deleteSubscriber(id).unwrap();
      toast.success('Subscriber deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete subscriber.'));
    }
  };

  const handleExport = async (format: SubscriberExportFormat) => {
    try {
      const blob = await triggerExport({ format, search: search || undefined, status, range }).unwrap();
      const extension = format === 'xlsx' ? 'xlsx' : format;
      downloadBlob(`snackco-subscribers-${new Date().toISOString().slice(0, 10)}.${extension}`, blob);
      toast.success('Export ready.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to export subscribers.'));
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Newsletter | SnackCo Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">Newsletter subscribers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalSubscribers} total subscriber{totalSubscribers === 1 ? '' : 's'} · {activeSubscribers} active
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdminSearchForm
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={handleSearchSubmit}
          placeholder="Search by email…"
        />

        <div className="flex flex-wrap gap-2">
          {EXPORT_FORMATS.map((format) => (
            <Button
              key={format.value}
              type="button"
              variant="outline"
              size="sm"
              disabled={isExporting}
              onClick={() => handleExport(format.value)}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" /> {format.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {RANGE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => {
              setRange(filter.value);
              setPage(1);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              range === filter.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/70 bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              status === filter.value
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border/70 bg-card text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort('email')}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Email {sortIcon('email')}
                </button>
              </th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">
                <button
                  type="button"
                  onClick={() => toggleSort('createdAt')}
                  className="inline-flex items-center gap-1 hover:text-foreground"
                >
                  Subscribed on {sortIcon('createdAt')}
                </button>
              </th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows columns={4} />
            ) : subscribers.length === 0 ? (
              <TableStateRow colSpan={4}>No subscribers match this filter.</TableStateRow>
            ) : (
              subscribers.map((subscriber) => (
                <tr
                  key={subscriber._id}
                  className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/50"
                >
                  <td className="px-4 py-3 font-semibold">
                    <span className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                      {subscriber.email}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill tone={subscriber.isActive ? 'success' : 'neutral'}>
                      {subscriber.isActive ? 'Active' : 'Unsubscribed'}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(subscriber.createdAt, 'long')}</td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(subscriber._id, subscriber.email)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {isFetching && !isLoading && <RefreshingIndicator />}
      </div>

      {pagination.totalPages > 1 && (
        <SearchPagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </section>
  );
}
