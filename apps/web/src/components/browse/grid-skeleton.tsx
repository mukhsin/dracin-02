import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Kelas grid responsif bersama untuk hasil jelajah. */
export const DRAMA_GRID_CLASS =
  "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

interface DramaGridSkeletonProps {
  count?: number;
  className?: string;
}

/** Skeleton grid poster saat hasil sedang dimuat. */
export function DramaGridSkeleton({
  count = 12,
  className,
}: DramaGridSkeletonProps) {
  return (
    <div className={cn(DRAMA_GRID_CLASS, className)} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Skeleton className="aspect-[2/3] w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}
