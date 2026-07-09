import type { OrderStatus } from '@/types/order';
import { cn } from '@/utils/cn';

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  confirmed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  packed: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  shipped: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  out_for_delivery: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  delivered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  cancelled: 'bg-red-500/10 text-red-600 dark:text-red-400',
  return_requested: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  returned: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  refunded: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  return_requested: 'Return requested',
  returned: 'Returned',
  refunded: 'Refunded',
};

export function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground',
        className,
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
