import { Mail, MailOpen, Phone, Trash2, X } from 'lucide-react';
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
  useDeleteContactMessageMutation,
  useGetContactMessagesQuery,
  useUpdateContactMessageStatusMutation,
} from '@/redux/api/contactApi';
import type { ContactMessage, ContactMessageDateRange, ContactMessageStatusFilter } from '@/types/contact';
import { formatDate } from '@/utils/formatDate';
import { getErrorMessage } from '@/utils/getErrorMessage';

const RANGE_FILTERS: Array<{ label: string; value: ContactMessageDateRange }> = [
  { label: 'All time', value: 'all' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 6 months', value: '6m' },
];

const STATUS_FILTERS: Array<{ label: string; value?: ContactMessageStatusFilter }> = [
  { label: 'All' },
  { label: 'New', value: 'new' },
  { label: 'Read', value: 'read' },
  { label: 'Resolved', value: 'resolved' },
];

const STATUS_TONE: Record<ContactMessage['status'], 'success' | 'warning' | 'neutral'> = {
  new: 'warning',
  read: 'neutral',
  resolved: 'success',
};

export default function AdminMessagesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [range, setRange] = useState<ContactMessageDateRange>('all');
  const [status, setStatus] = useState<ContactMessageStatusFilter | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);

  const { data, isLoading, isFetching } = useGetContactMessagesQuery({
    search: search || undefined,
    status,
    range,
    page,
  });
  const [updateStatus] = useUpdateContactMessageStatusMutation();
  const [deleteMessage] = useDeleteContactMessageMutation();

  const messages = data?.data?.messages ?? [];
  const pagination = data?.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 };
  const totalMessages = data?.data?.totalMessages ?? 0;
  const unreadMessages = data?.data?.unreadMessages ?? 0;

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleOpenMessage = async (message: ContactMessage) => {
    setActiveMessage(message);
    if (message.status === 'new') {
      try {
        await updateStatus({ id: message._id, status: 'read' }).unwrap();
      } catch {
        // non-critical — the modal already shows the message either way
      }
    }
  };

  const syncActiveMessage = (id: string, nextStatus: ContactMessage['status']) => {
    setActiveMessage((current) => (current && current._id === id ? { ...current, status: nextStatus } : current));
  };

  const handleToggleRead = async (message: ContactMessage) => {
    const nextStatus = message.status === 'new' ? 'read' : 'new';
    try {
      await updateStatus({ id: message._id, status: nextStatus }).unwrap();
      syncActiveMessage(message._id, nextStatus);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update message status.'));
    }
  };

  const handleMarkResolved = async (message: ContactMessage) => {
    const nextStatus = message.status === 'resolved' ? 'read' : 'resolved';
    try {
      await updateStatus({ id: message._id, status: nextStatus }).unwrap();
      syncActiveMessage(message._id, nextStatus);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update message status.'));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete the message from ${name}? This cannot be undone.`)) return;
    try {
      await deleteMessage(id).unwrap();
      toast.success('Message deleted.');
      if (activeMessage?._id === id) setActiveMessage(null);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete message.'));
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Customer Messages | Lotus Delight Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">Customer messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalMessages} total message{totalMessages === 1 ? '' : 's'} · {unreadMessages} unread
        </p>
      </div>

      <AdminSearchForm
        value={searchInput}
        onChange={setSearchInput}
        onSubmit={handleSearchSubmit}
        placeholder="Search by name, email, subject, or message…"
      />

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

      <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/70 bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">From</th>
              <th className="px-4 py-3 font-semibold">Subject</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Received</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows columns={5} />
            ) : messages.length === 0 ? (
              <TableStateRow colSpan={5}>No messages match this filter.</TableStateRow>
            ) : (
              messages.map((message) => (
                <tr
                  key={message._id}
                  className="cursor-pointer border-b border-border/40 transition-colors last:border-0 hover:bg-muted/50"
                  onClick={() => handleOpenMessage(message)}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold">{message.name}</p>
                    <p className="text-xs text-muted-foreground">{message.email}</p>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">{message.subject}</td>
                  <td className="px-4 py-3">
                    <StatusPill tone={STATUS_TONE[message.status]}>{message.status}</StatusPill>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(message.createdAt, 'long')}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1" onClick={(event) => event.stopPropagation()}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        title={message.status === 'new' ? 'Mark as read' : 'Mark as unread'}
                        onClick={() => handleToggleRead(message)}
                      >
                        {message.status === 'new' ? (
                          <MailOpen className="h-3.5 w-3.5" />
                        ) : (
                          <Mail className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={message.status === 'resolved' ? 'text-emerald-600' : ''}
                        title={message.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
                        onClick={() => handleMarkResolved(message)}
                      >
                        Resolve
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(message._id, message.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

      {activeMessage ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0"
            onClick={() => setActiveMessage(null)}
          />
          <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border/70 bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">{activeMessage.subject}</h2>
                <p className="mt-1 text-sm font-semibold">{activeMessage.name}</p>
              </div>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setActiveMessage(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <a href={`mailto:${activeMessage.email}`} className="flex items-center gap-1.5 hover:text-primary">
                <Mail className="h-3.5 w-3.5" /> {activeMessage.email}
              </a>
              {activeMessage.phone ? (
                <a href={`tel:${activeMessage.phone}`} className="flex items-center gap-1.5 hover:text-primary">
                  <Phone className="h-3.5 w-3.5" /> {activeMessage.phone}
                </a>
              ) : null}
              <span>{formatDate(activeMessage.createdAt, 'datetime')}</span>
            </div>

            <p className="mt-4 whitespace-pre-wrap rounded-xl bg-muted/50 p-4 text-sm leading-6">
              {activeMessage.message}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}>
                  Reply by email
                </a>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleMarkResolved(activeMessage)}
              >
                {activeMessage.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
