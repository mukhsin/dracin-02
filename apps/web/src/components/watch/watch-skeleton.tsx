import { Skeleton } from "@/components/ui/skeleton";

export function WatchSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-5 w-32" />
    </div>
  );
}
