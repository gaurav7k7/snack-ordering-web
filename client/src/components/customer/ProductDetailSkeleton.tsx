import { Skeleton } from '@/components/shared/Skeleton';

export function ProductDetailSkeleton() {
  return (
    <section className="container grid gap-10 pb-12 pt-6 lg:grid-cols-[1fr_0.9fr]">
      <div className="grid gap-4 lg:grid-cols-[88px_1fr]">
        <div className="order-2 flex gap-3 lg:order-1 lg:flex-col">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-20 shrink-0 rounded-md" />
          ))}
        </div>
        <Skeleton className="order-1 aspect-square w-full rounded-lg lg:order-2" />
      </div>

      <div>
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-10 w-3/4" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <Skeleton className="mt-6 h-6 w-32" />
        <Skeleton className="mt-6 h-12 w-48" />
        <div className="mt-8 flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-md" />
          <Skeleton className="h-12 w-12 rounded-md" />
        </div>
      </div>
    </section>
  );
}
