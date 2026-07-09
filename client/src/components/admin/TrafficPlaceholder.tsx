import { BarChart3 } from 'lucide-react';

export function TrafficPlaceholder() {
  return (
    <div className="grid min-h-[200px] place-items-center rounded-2xl border border-dashed border-border/70 bg-background p-6 text-center">
      <div>
        <BarChart3 className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-semibold">Traffic analytics coming soon</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Page-view and visitor tracking isn't wired up yet — this panel is a placeholder until an
          analytics provider is connected.
        </p>
      </div>
    </div>
  );
}
