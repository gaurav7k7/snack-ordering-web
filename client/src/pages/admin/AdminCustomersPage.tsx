import { Ban, CheckCircle2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { AdminSearchForm } from '@/components/admin/AdminSearchForm';
import { StatusPill } from '@/components/admin/StatusPill';
import { RefreshingIndicator, TableStateRow } from '@/components/admin/TableStateRow';
import { TableSkeletonRows } from '@/components/admin/TableSkeletonRows';
import { SearchPagination } from '@/components/shared/SearchPagination';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import {
  useBlockCustomerMutation,
  useDeleteCustomerMutation,
  useGetAllCustomersQuery,
  useUnblockCustomerMutation,
} from '@/redux/api/adminUsersApi';
import { cldUrl } from '@/utils/cloudinaryImage';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { formatDate } from '@/utils/formatDate';

const STATUS_FILTERS: Array<{ label: string; value?: 'active' | 'blocked' }> = [
  { label: 'All' },
  { label: 'Active', value: 'active' },
  { label: 'Blocked', value: 'blocked' },
];

export default function AdminCustomersPage() {
  const [statusFilter, setStatusFilter] = useState<'active' | 'blocked' | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetAllCustomersQuery({ status: statusFilter, search, page });
  const [blockCustomer] = useBlockCustomerMutation();
  const [unblockCustomer] = useUnblockCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();

  const customers = data?.data?.customers ?? [];
  const pagination = data?.data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 1 };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleBlock = async (id: string, name: string) => {
    const reason = window.prompt(`Why are you blocking ${name}? (optional)`) ?? '';
    try {
      await blockCustomer({ id, reason }).unwrap();
      toast.success('Customer blocked.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to block customer.'));
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockCustomer(id).unwrap();
      toast.success('Customer unblocked.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to unblock customer.'));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Permanently delete ${name}'s account? This cannot be undone.`)) return;
    try {
      await deleteCustomer(id).unwrap();
      toast.success('Customer deleted.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete customer.'));
    }
  };

  return (
    <section className="space-y-6">
      <Helmet>
        <title>Customers | Lotus Delight Admin</title>
      </Helmet>

      <div>
        <h1 className="text-3xl font-black">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {pagination.total} customer{pagination.total === 1 ? '' : 's'} registered.
        </p>
      </div>

      <AdminSearchForm
        value={searchInput}
        onChange={setSearchInput}
        onSubmit={handleSearchSubmit}
        placeholder="Search by name, email, or phone…"
      />

      <div className="flex gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => {
              setStatusFilter(filter.value);
              setPage(1);
            }}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              statusFilter === filter.value
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
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Contact</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows columns={5} />
            ) : customers.length === 0 ? (
              <TableStateRow colSpan={5}>No customers match this filter.</TableStateRow>
            ) : (
              customers.map((customer) => (
                <tr key={customer._id} className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Link
                      to={ROUTES.adminCustomerDetail(customer._id)}
                      className="flex items-center gap-3 font-semibold hover:text-primary"
                    >
                      <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {customer.avatar ? (
                          <img src={cldUrl(customer.avatar, 'avatar')} alt="" loading="lazy" className="h-full w-full object-cover" />
                        ) : (
                          customer.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      {customer.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <p>{customer.email}</p>
                    {customer.phone && <p className="text-xs">{customer.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(customer.createdAt, 'long')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill tone={customer.isActive ? 'success' : 'danger'} title={customer.blockedReason}>
                      {customer.isActive ? 'Active' : 'Blocked'}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {customer.isActive ? (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleBlock(customer._id, customer.name)}>
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleUnblock(customer._id)}>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleDelete(customer._id, customer.name)}
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
    </section>
  );
}
