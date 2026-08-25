import { useInfiniteQuery } from "@tanstack/react-query";

import { fetchDramas, fetchFeatured } from "@/lib/api";

const STALE_TIME_MS = 60_000;
export const DRAMA_GRID_PAGE_SIZE = 24;

export function useFeaturedDramas(limit = 10) {
  return useInfiniteQuery({
    queryKey: ["dramas", "featured", limit],
    queryFn: () => fetchFeatured(limit),
    initialPageParam: 0,
    /** Featured tidak berpaginasi: selalu satu halaman. */
    getNextPageParam: () => undefined,
    staleTime: STALE_TIME_MS,
  });
}

export function useDramaGrid(limit = DRAMA_GRID_PAGE_SIZE) {
  return useInfiniteQuery({
    queryKey: ["dramas", "grid", limit],
    queryFn: ({ pageParam }) => fetchDramas({ page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: STALE_TIME_MS,
  });
}
