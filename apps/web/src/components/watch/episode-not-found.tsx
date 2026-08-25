import { Link } from "@tanstack/react-router";

import { buttonVariants } from "@/components/ui/button";

interface EpisodeNotFoundViewProps {
  slug: string;
}

export function EpisodeNotFoundView({ slug }: EpisodeNotFoundViewProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border bg-card px-6 py-16 text-center"
    >
      <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
        404
      </p>
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        Episode tidak ditemukan
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Episode yang kamu cari tidak ada atau sudah dihapus.
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
