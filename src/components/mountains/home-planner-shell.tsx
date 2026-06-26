import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  mountainCount: number;
};

export function HomePlannerShell({ mountainCount }: Props) {
  return (
    <section id="planner" className="scroll-mt-24 sm:scroll-mt-28" aria-busy="true" aria-label={`Loading hike planner for ${mountainCount} mountains`}>
      <div className="overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-border bg-[linear-gradient(180deg,rgba(224,242,254,0.35)_0%,var(--card)_55%)] px-4 py-6 sm:px-8 sm:py-8">
          <div className="mx-auto max-w-2xl">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700">Hike planner</p>
                <Skeleton className="mt-2 h-9 w-64 max-w-full" />
                <Skeleton className="mt-2 h-4 w-full max-w-md" />
              </div>
              <Skeleton className="h-9 w-24 rounded-full" />
            </div>

            <div className="mt-8 space-y-6">
              <div>
                <Skeleton className="h-4 w-36" />
                <Skeleton className="mt-2 h-14 w-full rounded-2xl" />
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 w-28 rounded-full" />
                  ))}
                </div>
              </div>

              <div>
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-2 h-14 w-full rounded-2xl" />
              </div>

              <Skeleton className="h-24 w-full rounded-2xl" />

              <Button size="lg" className="h-12 w-full text-base sm:h-14" disabled>
                Check hiking weather
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-[linear-gradient(180deg,#fdfdfd_0%,#f8fafc_100%)] p-4 sm:p-8">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="mt-3 h-8 w-72 max-w-full" />
          <div className="mt-6 flex min-h-[320px] items-center justify-center rounded-[20px] border border-dashed border-border bg-card px-6 py-8 sm:min-h-[380px]">
            <div className="w-full max-w-md space-y-3 text-center">
              <Skeleton className="mx-auto h-4 w-24" />
              <Skeleton className="mx-auto h-8 w-full max-w-sm" />
              <Skeleton className="mx-auto h-16 w-full max-w-md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
