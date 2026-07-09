import type { LucideIcon } from 'lucide-react';

import { CHART_STATUS } from '@/constants/chartPalette';
import { cn } from '@/utils/cn';

type StatCardTone = 'default' | 'good' | 'warning' | 'serious' | 'critical';

const TONE_STYLES: Record<StatCardTone, { bg: string; color: string }> = {
  default: { bg: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' },
  good: { bg: `${CHART_STATUS.good}1a`, color: CHART_STATUS.good },
  warning: { bg: `${CHART_STATUS.warning}22`, color: '#a86a00' },
  serious: { bg: `${CHART_STATUS.serious}22`, color: CHART_STATUS.serious },
  critical: { bg: `${CHART_STATUS.critical}1a`, color: CHART_STATUS.critical },
};

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: StatCardTone;
  hint?: string;
  className?: string;
};

export function StatCard({ label, value, icon: Icon, tone = 'default', hint, className }: StatCardProps) {
  const styles = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-black tabular-nums">{value}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: styles.bg, color: styles.color }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
