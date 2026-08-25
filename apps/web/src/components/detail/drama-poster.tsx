import type { DramaDto } from "@dracin/shared";
import { useState } from "react";

import { cn } from "@/lib/utils";

interface DramaPosterProps {
  drama: DramaDto;
  className?: string;
}

export function DramaPoster({ drama, className }: DramaPosterProps) {
  const [posterFailed, setPosterFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-xl border bg-card shadow-sm",
        className,
      )}
    >
      {drama.posterUrl && !posterFailed ? (
        <img
          src={drama.posterUrl}
          alt={`Poster ${drama.title}`}
          onError={() => setPosterFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/50 via-accent to-background">
          <span className="text-6xl font-bold text-foreground/80">
            {drama.title.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
