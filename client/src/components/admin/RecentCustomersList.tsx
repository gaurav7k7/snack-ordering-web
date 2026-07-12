import { cldUrl } from '@/utils/cloudinaryImage';
import { formatDate } from '@/utils/formatDate';

type RecentCustomer = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
};

export function RecentCustomersList({ customers }: { customers: RecentCustomer[] }) {
  if (!customers.length) {
    return <p className="text-sm text-muted-foreground">No customers yet.</p>;
  }

  return (
    <div className="space-y-3">
      {customers.map((customer) => (
        <div key={customer._id} className="flex items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-sm font-bold text-primary">
            {customer.avatar ? (
              <img src={cldUrl(customer.avatar, 'avatar')} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              customer.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{customer.name}</p>
            <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
          </div>
          <p className="shrink-0 text-xs text-muted-foreground">
            {formatDate(customer.createdAt, 'short')}
          </p>
        </div>
      ))}
    </div>
  );
}
