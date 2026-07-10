import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

type StatusTone = 'success' | 'danger' | 'warning' | 'neutral';

type StatusPillProps = {
  tone: StatusTone;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  className?: string;
};

const TONE_CLASSES: Record<StatusTone, string> = {
  success: 'bg-emerald-500/10 text-emerald-600',
  danger: 'bg-red-500/10 text-red-600',
  warning: 'bg-amber-500/10 text-amber-600',
  neutral: 'bg-muted text-muted-foreground',
};

const TONE_HOVER_CLASSES: Record<StatusTone, string> = {
  success: 'hover:bg-emerald-500/20',
  danger: 'hover:bg-red-500/20',
  warning: 'hover:bg-amber-500/20',
  neutral: 'hover:bg-accent',
};

export function StatusPill({ tone, children, onClick, title, className }: StatusPillProps) {
  const classes = cn(
    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
    TONE_CLASSES[tone],
    onClick && ['transition', TONE_HOVER_CLASSES[tone]],
    className,
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} title={title} className={classes}>
        {children}
      </button>
    );
  }

  return (
    <span className={classes} title={title}>
      {children}
    </span>
  );
}
