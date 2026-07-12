import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/cn';

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; to: string };
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('rounded-3xl border border-dashed bg-card p-10 text-center', className)}>
      {Icon ? <Icon className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" /> : null}
      <p className={cn('text-lg font-semibold', Icon && 'mt-3')}>{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {action ? (
        <Button asChild className="mt-6">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
