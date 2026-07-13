import { Loader2 } from 'lucide-react';

import { cn } from '@/utils/cn';

type PageLoaderProps = {
  fullScreen?: boolean;
  className?: string;
};

export function PageLoader({ fullScreen = false, className }: PageLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'grid w-full place-items-center text-sm text-muted-foreground',
        fullScreen ? 'min-h-screen' : 'min-h-[50vh]',
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span>Loading...</span>
      </div>
    </div>
  );
}
