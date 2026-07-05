import { Skeleton } from '@/components/shared/Skeleton';

export function ProductGridSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card p-3">
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="mt-4 h-4 w-2/3" />
          <Skeleton className="mt-3 h-5 w-full" />
          <Skeleton className="mt-5 h-10 w-full" />
        </div>
      ))}
    </div>
  );
}
