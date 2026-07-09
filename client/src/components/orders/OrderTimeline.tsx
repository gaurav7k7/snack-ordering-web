import { Ban, Check, RotateCcw } from 'lucide-react';

import { STATUS_LABELS } from '@/components/orders/OrderStatusBadge';
import type { Order, OrderStatus } from '@/types/order';
import { cn } from '@/utils/cn';

const HAPPY_PATH: OrderStatus[] = [
  'pending',
  'confirmed',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
];

const SIDE_TRACK_STATUSES: OrderStatus[] = ['cancelled', 'return_requested', 'returned', 'refunded'];

function formatTimestamp(value?: string) {
  if (!value) return null;
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function OrderTimeline({ order }: { order: Order }) {
  const historyByStatus = new Map(order.statusHistory?.map((entry) => [entry.status, entry]));
  const isSideTrack = SIDE_TRACK_STATUSES.includes(order.status);

  if (isSideTrack) {
    const relevantHistory = order.statusHistory?.filter((entry) =>
      SIDE_TRACK_STATUSES.includes(entry.status),
    );

    return (
      <div className="space-y-4">
        {relevantHistory?.map((entry, index) => (
          <div key={`${entry.status}-${index}`} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                {entry.status === 'returned' || entry.status === 'refunded' ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}
              </div>
              {index < (relevantHistory.length ?? 0) - 1 && (
                <div className="mt-1 h-full w-px flex-1 bg-border" />
              )}
            </div>
            <div className="pb-6">
              <p className="font-semibold">{STATUS_LABELS[entry.status]}</p>
              <p className="text-sm text-muted-foreground">{formatTimestamp(entry.timestamp)}</p>
              {entry.note && <p className="mt-1 text-sm text-muted-foreground">{entry.note}</p>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const currentIndex = HAPPY_PATH.indexOf(order.status);

  return (
    <div className="space-y-4">
      {HAPPY_PATH.map((status, index) => {
        const isComplete = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const entry = historyByStatus.get(status);

        return (
          <div key={status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-colors',
                  isComplete
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground',
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
              </div>
              {index < HAPPY_PATH.length - 1 && (
                <div
                  className={cn('mt-1 h-full w-px flex-1', isComplete ? 'bg-primary' : 'bg-border')}
                />
              )}
            </div>
            <div className="pb-6">
              <p className={cn('font-semibold', isCurrent && 'text-primary')}>
                {STATUS_LABELS[status]}
              </p>
              <p className="text-sm text-muted-foreground">
                {entry ? formatTimestamp(entry.timestamp) : isComplete ? '—' : 'Pending'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
