import { useQuery } from "@tanstack/react-query";

import { ApiError, fetchDramaBySlug } from "@/lib/api";

const STALE_TIME_MS = 60_000;
const MAX_RETRIES = 1;

export function useDramaDetail(slug: string) {
  return useQuery({
    queryKey: ["dramas", "detail", slug],
    queryFn: () => fetchDramaBySlug(slug),
    staleTime: STALE_TIME_MS,
    /** Retry ringan; 404 tidak perlu dicoba ulang. */
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < MAX_RETRIES;
    },
  });
}
