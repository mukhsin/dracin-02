import { useCallback, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { BrowseEmptyState } from "@/components/browse/browse-empty";
import {
  DRAMA_GRID_CLASS,
  DramaGridSkeleton,
} from "@/components/browse/grid-skeleton";
import { GenreChips } from "@/components/browse/genre-chips";
import { BrowsePagination } from "@/components/browse/pagination";
import { SearchInput } from "@/components/browse/search-input";
import { SortSelect } from "@/components/browse/sort-select";
import { DramaCard } from "@/components/drama-card";
import { ErrorState } from "@/components/error-state";
import { cn } from "@/lib/utils";
import type { BrowseSearch } from "@/hooks/use-browse";
import { useBrowseDramas, useGenres } from "@/hooks/use-browse";

/**
 * Search param URL (?q=&genre=&sort=&page=) divalidasi ketat:
 * nilai tidak valid/absen jatuh ke default tanpa membuat route error.
 */
const browseSearchSchema = z.object({
  q: z.string().optional().catch(undefined),
  genre: z.string().optional().catch(undefined),
  sort: z.enum(["newest", "popular", "title"]).optional().catch(undefined),
  page: z.coerce.number().int().min(1).optional().catch(undefined),
});

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>): BrowseSearch =>
    browseSearchSchema.parse(search),
  component: BrowsePage,
});

function BrowsePage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const q = search.q?.trim() || undefined;
  const genre = search.genre;
  const sort = search.sort;
  const page = search.page ?? 1;

  const genresQuery = useGenres();
  const dramasQuery = useBrowseDramas({ q, genre, sort, page });

  const items = dramasQuery.data?.items ?? [];
  const totalPages = dramasQuery.data?.pagination.totalPages ?? 0;

  /**
   * Ubah filter (q/genre/sort): selalu reset page ke 1 dan ganti history
   * entry (replace) agar mengetik tidak membanjiri tombol back.
   */
  const setFilter = useCallback(
    (patch: Partial<BrowseSearch>) => {
      void navigate({
        search: (prev) => {
          const next: BrowseSearch = { ...prev };
          if ("q" in patch) next.q = patch.q;
          if ("genre" in patch) next.genre = patch.genre;
          if ("sort" in patch) next.sort = patch.sort;
          // Filter berubah → kembali ke halaman pertama.
          next.page = undefined;
          return next;
        },
        replace: true,
      });
    },
    [navigate],
  );

  const handlePageChange = useCallback(
    (next: number) => {
      void navigate({
        search: (prev) => ({ ...prev, page: next <= 1 ? undefined : next }),
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [navigate],
  );

  const handleSearchCommit = useCallback(
    (raw: string) => {
      const nextQ = raw.trim() || undefined;
      if (nextQ === q) return;
      setFilter({ q: nextQ });
    },
    [q, setFilter],
  );

  // Jaga-jaga: URL dengan ?page= di luar rentang dikembalikan ke halaman 1.
  useEffect(() => {
    if (dramasQuery.isPlaceholderData) return;
    if (totalPages >= 1 && page > totalPages) handlePageChange(1);
  }, [dramasQuery.isPlaceholderData, handlePageChange, page, totalPages]);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Jelajah Drama</h1>
        <p className="text-sm text-muted-foreground">
          Temukan drama berdasarkan judul, genre, atau urutan favoritmu.
        </p>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={q ?? ""}
          onCommit={handleSearchCommit}
          className="sm:flex-1"
        />
        <SortSelect
          value={sort ?? "newest"}
          onChange={(nextSort) =>
            setFilter({ sort: nextSort === "newest" ? undefined : nextSort })
          }
        />
      </div>

      <GenreChips
        genres={genresQuery.data ?? []}
        isLoading={genresQuery.isPending}
        activeGenre={genre}
        onSelect={(nextGenre) => setFilter({ genre: nextGenre })}
      />

      <section aria-busy={dramasQuery.isPending}>
        {dramasQuery.isPending ? (
          <DramaGridSkeleton />
        ) : dramasQuery.isError ? (
          <ErrorState onRetry={() => void dramasQuery.refetch()} />
        ) : items.length === 0 ? (
          <BrowseEmptyState
            q={q}
            genre={genre}
            onReset={() => setFilter({ q: undefined, genre: undefined })}
          />
        ) : (
          <>
            <div
              className={cn(
                DRAMA_GRID_CLASS,
                "transition-opacity duration-200",
                dramasQuery.isFetching && "opacity-50",
              )}
            >
              {items.map((drama) => (
                <DramaCard key={drama.id} drama={drama} />
              ))}
            </div>
            <BrowsePagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              disabled={dramasQuery.isFetching}
            />
          </>
        )}
      </section>
    </div>
  );
}
