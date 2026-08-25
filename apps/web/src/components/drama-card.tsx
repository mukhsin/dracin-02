import type { DramaDto } from "@dracin/shared";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DramaCardProps {
  drama: DramaDto;
  className?: string;
}

export function DramaCard({ drama, className }: DramaCardProps) {
  const [posterFailed, setPosterFailed] = useState(false);

  return (
    <a
      href={`/drama/${drama.slug}`}
      className={cn(
        "group block overflow-hidden rounded-lg border bg-card shadow-sm transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        {drama.posterUrl && !posterFailed ? (
          <img
            src={drama.posterUrl}
            alt={`Poster ${drama.title}`}
            loading="lazy"
            onError={() => setPosterFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/50 via-accent to-background">
            <span className="text-3xl font-bold text-foreground/80">
              {drama.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <Badge
          variant="secondary"
          className="absolute right-1.5 top-1.5 bg-background/80 backdrop-blur"
        >
          {drama.totalEpisodes} ep
        </Badge>
      </div>
      <div className="p-2">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {drama.title}
        </h3>
      </div>
    </a>
  );
}
