import type { DramaDto } from "@dracin/shared";
import { createFileRoute } from "@tanstack/react-router";

import { DetailSkeleton } from "@/components/detail/detail-skeleton";
import { DramaNotFoundView } from "@/components/detail/not-found-view";
import { DramaPoster } from "@/components/detail/drama-poster";
import { ErrorState } from "@/components/error-state";
import { SectionHeader } from "@/components/section-header";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDramaDetail } from "@/hooks/use-drama-detail";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/drama/$slug")({
  component: DramaDetailPage,
});

function DramaDetailPage() {
  const { slug } = Route.useParams();
  const detailQuery = useDramaDetail(slug);

  if (detailQuery.isPending) {
    return <DetailSkeleton />;
  }

  if (detailQuery.isError) {
    if (detailQuery.error instanceof ApiError && detailQuery.error.status === 404) {
      return <DramaNotFoundView slug={slug} />;
    }
    return <ErrorState onRetry={() => void detailQuery.refetch()} />;
  }

  return <DramaDetailView drama={detailQuery.data} />;
}

function DramaDetailView({ drama }: { drama: DramaDto }) {
  return (
    <div className="space-y-10">
      <div className="md:flex md:items-start md:gap-8">
        <DramaPoster
          drama={drama}
          className="mx-auto w-48 shrink-0 sm:w-56 md:mx-0 md:w-64 lg:w-72"
        />
        <div className="mt-6 min-w-0 flex-1 space-y-4 text-center md:mt-0 md:text-left">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {drama.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-1.5 md:justify-start">
            <Badge variant={drama.status === "ongoing" ? "default" : "secondary"}>
              {drama.status === "ongoing" ? "Ongoing" : "Tamat"}
            </Badge>
            <Badge variant="outline">{drama.totalEpisodes} episode</Badge>
            {drama.genres.map((genre) => (
              <a
                key={genre}
                href={`/browse?genre=${encodeURIComponent(genre)}`}
                className={cn(
                  badgeVariants({ variant: "outline" }),
                  "hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {genre}
              </a>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {drama.description || "Sinopsis belum tersedia."}
          </p>
        </div>
      </div>

      <section>
        <SectionHeader title="Episode" />
        {drama.totalEpisodes === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada episode.</p>
        ) : (
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
            {Array.from({ length: drama.totalEpisodes }, (_, i) => i + 1).map(
              (number) => (
                <a
                  key={number}
                  href={`/watch/${drama.slug}/${number}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {number}
                </a>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}
