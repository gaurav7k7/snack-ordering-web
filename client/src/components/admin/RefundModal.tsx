import { X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatCurrency';

type RefundModalProps = {
  orderTotal: number;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: (payload: { amount: number; reason: string }) => void;
};

export function RefundModal({ orderTotal, isSubmitting, onCancel, onConfirm }: RefundModalProps) {
  const [amount, setAmount] = useState(orderTotal);
  const [reason, setReason] = useState('');

  const isValid = amount > 0 && amount <= orderTotal;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black">Refund this order</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This issues a real refund via Razorpay. Order total is {formatCurrency(orderTotal)}.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Refund amount (₹)</span>
            <input
              type="number"
              min={1}
              max={orderTotal}
              value={amount}
              onChange={(event) => setAmount(Number(event.target.value))}
              className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
            {!isValid && (
              <span className="text-xs text-destructive">
                Enter an amount between ₹1 and {formatCurrency(orderTotal)}.
              </span>
            )}
          </label>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Reason (optional)</span>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="e.g. Item arrived damaged"
              className="rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Never mind
          </Button>
          <Button
            type="button"
            disabled={!isValid || isSubmitting}
            onClick={() => onConfirm({ amount, reason: reason.trim() })}
          >
            {isSubmitting ? 'Processing…' : 'Process refund'}
          </Button>
        </div>
      </div>
    </div>
  );
}
