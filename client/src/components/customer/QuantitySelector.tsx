import { Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';

type QuantitySelectorProps = {
  value: number;
  max: number;
  onChange: (quantity: number) => void;
};

export function QuantitySelector({ value, max, onChange }: QuantitySelectorProps) {
  const safeMax = Math.max(max, 1);

  return (
    <div className="inline-flex w-fit items-center rounded-md border bg-background">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-11 w-11"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <input
        aria-label="Quantity"
        value={value}
        min={1}
        max={safeMax}
        type="number"
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          onChange(Math.min(safeMax, Math.max(1, Number.isNaN(nextValue) ? 1 : nextValue)));
        }}
        className="h-11 w-14 border-x bg-transparent text-center font-semibold outline-none"
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-11 w-11"
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(safeMax, value + 1))}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}
