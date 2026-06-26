import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-200/90 dark:bg-slate-600/55", className)}
      {...props}
    />
  );
}

export { Skeleton };
