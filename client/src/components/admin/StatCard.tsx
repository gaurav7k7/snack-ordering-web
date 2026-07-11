import { motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Skeleton } from '@/components/shared/Skeleton';
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

// Only animates plain numeric values — pre-formatted strings (currency,
// compact "1.2K", ratings) are rendered as-is rather than parsed back into
// a number, which would be fragile for little visual gain.
function useCountUp(target: number, enabled: boolean, duration = 700) {
  const [value, setValue] = useState(enabled ? 0 : target);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      setValue(target);
      return;
    }

    const start = performance.now();

    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, enabled, duration]);

  return value;
}

export function StatCard({ label, value, icon: Icon, tone = 'default', hint, className }: StatCardProps) {
  const styles = TONE_STYLES[tone];
  const prefersReducedMotion = useReducedMotion();
  const isNumeric = typeof value === 'number';
  const countedValue = useCountUp(isNumeric ? value : 0, isNumeric && !prefersReducedMotion);
  const displayValue = isNumeric ? countedValue.toLocaleString('en-IN') : value;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-2xl font-black tabular-nums">{displayValue}</p>
          {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
        </div>
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: styles.bg, color: styles.color }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
        </div>
        <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
      </div>
    </div>
  );
}
