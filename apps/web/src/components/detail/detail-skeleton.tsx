import { Skeleton } from "@/components/ui/skeleton";

export function DetailSkeleton() {
  return (
    <div className="space-y-10">
      <div className="md:flex md:items-start md:gap-8">
        <Skeleton className="mx-auto aspect-[2/3] w-48 rounded-xl sm:w-56 md:mx-0 md:w-64 lg:w-72" />
        <div className="mt-6 flex-1 space-y-4 md:mt-0">
          <Skeleton className="h-9 w-3/4" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
      <section>
        <Skeleton className="mb-4 h-7 w-28" />
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {Array.from({ length: 20 }, (_, i) => (
            <Skeleton key={i} className="h-8 rounded-md" />
          ))}
        </div>
      </section>
    </div>
  );
}
