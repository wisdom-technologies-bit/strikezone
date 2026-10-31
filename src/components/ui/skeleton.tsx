import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
  /** Lines renders stacked bars; a single bar otherwise. */
  lines?: number;
}

export function Skeleton({ className, lines }: SkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div className={cn("flex w-full flex-col gap-2", className)} aria-hidden="true">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cn(
              "h-3 animate-pulse rounded-control bg-raised",
              index === lines - 1 ? "w-2/3" : "w-full",
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn("h-3 w-full animate-pulse rounded-control bg-raised", className)}
      aria-hidden="true"
    />
  );
}
