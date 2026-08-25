import { Button } from "@/components/ui/button";

interface BrowseEmptyStateProps {
  /** Kata kunci pencarian aktif (jika ada). */
  q?: string;
  /** Genre filter aktif (jika ada). */
  genre?: string;
  onReset: () => void;
}

/** Empty state ramah untuk hasil jelajah yang kosong. */
export function BrowseEmptyState({ q, genre, onReset }: BrowseEmptyStateProps) {
  const parts: string[] = [];
  if (q) parts.push(`“${q}”`);
  if (genre) parts.push(`genre ${genre}`);
  const hasFilter = parts.length > 0;

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-8 text-muted-foreground"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
        <path d="m8 11h6" />
      </svg>
      <p className="text-sm text-muted-foreground">
        {hasFilter
          ? `Tidak ada hasil untuk ${parts.join(" di ")}.`
          : "Belum ada drama untuk ditampilkan."}
      </p>
      {hasFilter ? (
        <Button variant="outline" size="sm" onClick={onReset}>
          Hapus Filter
        </Button>
      ) : null}
    </div>
  );
}
