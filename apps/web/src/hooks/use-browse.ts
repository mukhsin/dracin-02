import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { fetchDramas, fetchGenres } from "@/lib/api";

const STALE_TIME_MS = 60_000;

/** Jumlah drama per halaman pada grid jelajah. */
export const BROWSE_PAGE_SIZE = 24;

export const BROWSE_SORT_VALUES = ["newest", "popular", "title"] as const;

export type BrowseSort = (typeof BROWSE_SORT_VALUES)[number];

/** Opsi sortir beserta labelnya untuk UI. */
export const BROWSE_SORT_OPTIONS: ReadonlyArray<{
  value: BrowseSort;
  label: string;
}> = [
  { value: "newest", label: "Terbaru" },
  { value: "popular", label: "Terpopuler" },
  { value: "title", label: "Judul A-Z" },
];

/** Bentuk search param URL halaman /browse (?q=&genre=&sort=&page=). */
export interface BrowseSearch {
  q?: string;
  genre?: string;
  sort?: BrowseSort;
  page?: number;
}

/** Filter efektif yang dikirim ke API. */
export interface BrowseFilters {
  q?: string;
  genre?: string;
  sort?: BrowseSort;
  page?: number;
}

/** Daftar genre beserta jumlah dramanya untuk chip filter. */
export function useGenres() {
  return useQuery({
    queryKey: ["genres"],
    queryFn: fetchGenres,
    staleTime: STALE_TIME_MS,
  });
}

/**
 * Satu halaman hasil jelajah sesuai filter di URL.
 * Page-driven (bukan infinite scroll): setiap kombinasi filter+page
 * adalah query tersendiri; data lama dipertahankan sebagai placeholder
 * saat berpindah halaman agar grid tidak kosong sesaat.
 */
export function useBrowseDramas(filters: BrowseFilters) {
  const { q, genre, sort, page = 1 } = filters;
  return useQuery({
    queryKey: ["dramas", "browse", { q, genre, sort, page }],
    queryFn: () =>
      fetchDramas({ page, limit: BROWSE_PAGE_SIZE, search: q, genre, sort }),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME_MS,
  });
}
