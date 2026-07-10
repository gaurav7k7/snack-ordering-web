import { X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

type ReasonModalProps = {
  title: string;
  description: string;
  reasons: string[];
  confirmLabel: string;
  isSubmitting?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
};

export function ReasonModal({
  title,
  description,
  reasons,
  confirmLabel,
  isSubmitting,
  onCancel,
  onConfirm,
}: ReasonModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const finalReason = selectedReason === 'Other' ? customReason.trim() : selectedReason;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border/70 bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
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

        <div className="mt-5 space-y-2">
          {[...reasons, 'Other'].map((reason) => (
            <label
              key={reason}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-background px-4 py-3 text-sm transition has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="reason"
                value={reason}
                checked={selectedReason === reason}
                onChange={(event) => setSelectedReason(event.target.value)}
                className="accent-primary"
              />
              {reason}
            </label>
          ))}
          {selectedReason === 'Other' && (
            <textarea
              value={customReason}
              onChange={(event) => setCustomReason(event.target.value)}
              rows={3}
              placeholder="Tell us more…"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
            />
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Never mind
          </Button>
          <Button
            type="button"
            variant="default"
            disabled={!finalReason || isSubmitting}
            onClick={() => finalReason && onConfirm(finalReason)}
          >
            {isSubmitting ? 'Submitting…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
