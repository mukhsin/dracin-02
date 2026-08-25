import type { DramaDto } from "@dracin/shared";
import { createFileRoute } from "@tanstack/react-router";

import { DramaCard } from "@/components/drama-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { SectionHeader } from "@/components/section-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDramaGrid, useFeaturedDramas } from "@/hooks/use-dramas";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const featuredQuery = useFeaturedDramas();
  const gridQuery = useDramaGrid();

  const featuredItems: DramaDto[] =
    featuredQuery.data?.pages.flatMap((page) => page) ?? [];
  const hero: DramaDto | undefined = featuredItems[0];

  const gridItems: DramaDto[] =
    gridQuery.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-10">
      {featuredQuery.isPending ? (
        <HeroSkeleton />
      ) : featuredQuery.isError ? (
        <ErrorState onRetry={() => void featuredQuery.refetch()} />
      ) : hero ? (
        <Hero drama={hero} />
      ) : null}

      {featuredQuery.isPending ? (
        <section>
          <SectionHeader title="Unggulan" />
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }, (_, i) => (
              <PosterSkeleton key={i} className="w-36 shrink-0 sm:w-40" />
            ))}
          </div>
        </section>
      ) : featuredItems.length > 0 ? (
        <section>
          <SectionHeader title="Unggulan" />
          <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
            {featuredItems.map((drama) => (
              <DramaCard
                key={drama.id}
                drama={drama}
                className="w-36 shrink-0 snap-start sm:w-40"
              />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader title="Semua Drama" />
        {gridQuery.isPending ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }, (_, i) => (
              <PosterSkeleton key={i} />
            ))}
          </div>
        ) : gridQuery.isError ? (
          <ErrorState onRetry={() => void gridQuery.refetch()} />
        ) : gridItems.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {gridItems.map((drama) => (
                <DramaCard key={drama.id} drama={drama} />
              ))}
            </div>
            {gridQuery.hasNextPage ? (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => void gridQuery.fetchNextPage()}
                  disabled={gridQuery.isFetchingNextPage}
                >
                  {gridQuery.isFetchingNextPage
                    ? "Memuat..."
                    : "Muat Lebih Banyak"}
                </Button>
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Semua drama sudah ditampilkan
              </p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function Hero({ drama }: { drama: DramaDto }) {
  return (
    <section className="relative overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-video w-full sm:aspect-[21/9]">
        {drama.posterUrl ? (
          <img
            src={drama.posterUrl}
            alt={`Latar ${drama.title}`}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-3 p-5 sm:max-w-2xl sm:p-8">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{drama.createdAt.slice(0, 4)}</Badge>
            <Badge variant="outline">
              {drama.status === "ongoing" ? "Ongoing" : "Tamat"}
            </Badge>
            {drama.genres.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="outline">
                {genre}
              </Badge>
            ))}
          </div>
          <h1 className="line-clamp-2 text-2xl font-bold tracking-tight sm:text-4xl">
            {drama.title}
          </h1>
          {drama.description ? (
            <p className="line-clamp-3 text-sm text-muted-foreground sm:text-base">
              {drama.description}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={`/drama/${drama.slug}`}
              className={buttonVariants({ size: "lg" })}
            >
              Tonton Sekarang
            </a>
            <a
              href={`/drama/${drama.slug}`}
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
              })}
            >
              Detail
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function PosterSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="aspect-[2/3] w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
    </div>
  );
}

function HeroSkeleton() {
  return <Skeleton className="aspect-video w-full rounded-xl sm:aspect-[21/9]" />;
}
