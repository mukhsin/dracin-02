import type { GenreWithCount } from "@dracin/shared";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GenreChipsProps {
  genres: GenreWithCount[];
  isLoading: boolean;
  /** Genre yang sedang aktif; undefined berarti "Semua". */
  activeGenre?: string;
  onSelect: (genre: string | undefined) => void;
  className?: string;
}

/** Chip filter genre: "Semua" + satu chip per genre dengan jumlah drama. */
export function GenreChips({
  genres,
  isLoading,
  activeGenre,
  onSelect,
  className,
}: GenreChipsProps) {
  if (isLoading) {
    return (
      <div
        aria-hidden="true"
        className={cn("flex flex-wrap gap-2", className)}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Filter genre"
      className={cn("flex flex-wrap gap-2", className)}
    >
      <Chip
        label="Semua"
        active={!activeGenre}
        onClick={() => onSelect(undefined)}
      />
      {genres.map((genre) => (
        <Chip
          key={genre.name}
          label={`${genre.name} (${genre.dramaCount})`}
          active={activeGenre === genre.name}
          onClick={() =>
            onSelect(activeGenre === genre.name ? undefined : genre.name)
          }
        />
      ))}
    </div>
  );
}

interface ChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {label}
    </button>
  );
}
