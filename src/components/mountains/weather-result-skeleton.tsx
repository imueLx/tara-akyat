import { Skeleton } from "@/components/ui/skeleton";

type SkeletonProps = {
  className?: string;
  label?: string;
};

export function WeatherResultSkeleton({
  className = "mt-4 space-y-3",
  label = "Loading weather results",
}: SkeletonProps) {
  return (
    <div className={className} role="status" aria-live="polite" aria-label={label}>
      <div className="rounded-3xl border border-border bg-card p-4 sm:p-5">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="mt-3 h-6 w-52 max-w-full rounded-full" />
        <Skeleton className="mt-2 h-4 w-full max-w-md rounded-full" />
        <Skeleton className="mt-2 h-4 w-5/6 max-w-sm rounded-full" />
        <div className="mt-4 flex flex-wrap gap-2">
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`weather-metric-skeleton-${index}`} className="rounded-2xl border border-border bg-card px-3 py-3">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="mt-3 h-6 w-16 rounded-full" />
            <Skeleton className="mt-2 h-3 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeatherDetailsSkeleton({
  className = "mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2",
  label = "Loading more weather details",
}: SkeletonProps) {
  return (
    <div className={className} role="status" aria-live="polite" aria-label={label}>
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={`weather-detail-skeleton-${index}`} className="rounded-2xl border border-border bg-card px-3 py-3 sm:px-4 sm:py-4">
          <Skeleton className="h-3 w-28 rounded-full" />
          <Skeleton className="mt-3 h-5 w-32 rounded-full" />
          <Skeleton className="mt-2 h-4 w-full rounded-full" />
          <Skeleton className="mt-2 h-4 w-5/6 rounded-full" />
        </div>
      ))}
    </div>
  );
}
