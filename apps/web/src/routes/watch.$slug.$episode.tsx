import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { EpisodeNotFoundView } from "@/components/watch/episode-not-found";
import { VideoPlayer } from "@/components/watch/video-player";
import { WatchSkeleton } from "@/components/watch/watch-skeleton";
import { ErrorState } from "@/components/error-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { useEpisode } from "@/hooks/use-episode";
import { ApiError } from "@/lib/api";

export const Route = createFileRoute("/watch/$slug/$episode")({
  component: WatchPage,
});

function WatchPage() {
  const { slug, episode } = Route.useParams();
  const episodeNumber = Number(episode);

  if (!Number.isInteger(episodeNumber) || episodeNumber <= 0) {
    return <InvalidEpisodeView slug={slug} rawValue={episode} />;
  }

  return <WatchView slug={slug} episodeNumber={episodeNumber} />;
}

function InvalidEpisodeView({ slug, rawValue }: { slug: string; rawValue: string }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-16 text-center"
    >
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Nomor episode tidak valid
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        &quot;{rawValue}&quot; bukan nomor episode yang sah.
      </p>
      <Link
        to="/drama/$slug"
        params={{ slug }}
        className={buttonVariants({ variant: "outline" })}
      >
        Kembali ke Drama
      </Link>
    </div>
  );
}

interface WatchViewProps {
  slug: string;
  episodeNumber: number;
}

function WatchView({ slug, episodeNumber }: WatchViewProps) {
  const episodeQuery = useEpisode(slug, episodeNumber);
  const [playerAttempt, setPlayerAttempt] = useState(0);

  if (episodeQuery.isPending) {
    return <WatchSkeleton />;
  }

  if (episodeQuery.isError) {
    const error = episodeQuery.error;
    if (error instanceof ApiError && error.status === 404) {
      return <EpisodeNotFoundView slug={slug} />;
    }
    return <ErrorState onRetry={() => void episodeQuery.refetch()} />;
  }

  const data = episodeQuery.data;
  const { prevNumber, nextNumber } = data.navigation;

  const retryPlayback = () => {
    setPlayerAttempt((attempt) => attempt + 1);
    void episodeQuery.refetch();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/drama/$slug"
          params={{ slug }}
          className="truncate text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          &larr; {data.drama.title}
        </Link>
        <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
          Episode {data.episode.number}
        </h1>
      </div>

      <VideoPlayer
        key={playerAttempt}
        src={data.episode.videoUrl}
        onRetry={retryPlayback}
      />

      <nav
        aria-label="Navigasi episode"
        className="flex items-center justify-between gap-3"
      >
        {prevNumber === null ? (
          <Button variant="outline" disabled>
            &lsaquo; Sebelumnya
          </Button>
        ) : (
          <Link
            to="/watch/$slug/$episode"
            params={{ slug, episode: String(prevNumber) }}
            className={buttonVariants({ variant: "outline" })}
          >
            &lsaquo; Sebelumnya
          </Link>
        )}
        {nextNumber === null ? (
          <Button variant="outline" disabled>
            Berikutnya &rsaquo;
          </Button>
        ) : (
          <Link
            to="/watch/$slug/$episode"
            params={{ slug, episode: String(nextNumber) }}
            className={buttonVariants({ variant: "outline" })}
          >
            Berikutnya &rsaquo;
          </Link>
        )}
      </nav>
    </div>
  );
}
