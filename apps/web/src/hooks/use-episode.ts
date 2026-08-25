import { useQuery } from "@tanstack/react-query";

import { ApiError, fetchEpisode } from "@/lib/api";

const STALE_TIME_MS = 30_000;
const MAX_RETRIES = 1;

export function useEpisode(slug: string, number: number) {
  return useQuery({
    queryKey: ["episodes", slug, number],
    queryFn: () => fetchEpisode(slug, number),
    staleTime: STALE_TIME_MS,
    /** Retry ringan; 404 (episode tak ada/out-of-range) tidak perlu dicoba ulang. */
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < MAX_RETRIES;
    },
  });
}
