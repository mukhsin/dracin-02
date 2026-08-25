import { env } from "../lib/env";

/** Bentuk item drama dari api-proxy (endpoint /drama/*). */
export interface UpstreamDrama {
  bookId: string | number;
  title?: string;
  cover?: string;
  intro?: string;
  chapterCount?: number;
  episodeCount?: number;
  playCount?: string | number;
}

interface UpstreamListResponse {
  status: boolean;
  message?: string;
  total?: number;
  data?: UpstreamDrama[];
}

/**
 * Bentuk item episode dari api-proxy (endpoint /drama/episodes/:bookId),
 * persis episodeList.push({...}) scraper lama dracin.js: index 0-based,
 * url hasil ch.cdnList?.[0]?.videoPathList?.[0]?.videoPath || ch.videoUrl.
 */
export interface UpstreamEpisode {
  index?: number;
  title?: string;
  url?: string | null;
}

export interface UpstreamEpisodesMetadata {
  title?: string;
  cover?: string;
  intro?: string;
}

interface UpstreamEpisodesResponse {
  status: boolean;
  message?: string;
  total?: number;
  metadata?: UpstreamEpisodesMetadata;
  data?: UpstreamEpisode[];
}

export interface UpstreamEpisodesResult {
  total: number;
  metadata: UpstreamEpisodesMetadata;
  items: UpstreamEpisode[];
}

async function getList(
  path: string,
  timeoutMs = 30_000,
): Promise<UpstreamDrama[]> {
  const res = await fetch(`${env.apiProxyUrl}${path}`, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`api-proxy ${path} -> HTTP ${res.status}`);
  }
  const body = (await res.json()) as UpstreamListResponse;
  if (!body.status || !Array.isArray(body.data)) {
    throw new Error(`api-proxy ${path} gagal: ${body.message ?? "unknown"}`);
  }
  return body.data;
}

/** Daftar episode lengkap satu drama + metadata untuk enrichment. */
async function getEpisodes(
  bookId: string,
  timeoutMs = 30_000,
): Promise<UpstreamEpisodesResult> {
  const path = `/drama/episodes/${encodeURIComponent(bookId)}`;
  const res = await fetch(`${env.apiProxyUrl}${path}`, {
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`api-proxy ${path} -> HTTP ${res.status}`);
  }
  const body = (await res.json()) as UpstreamEpisodesResponse;
  if (!body.status || !Array.isArray(body.data)) {
    throw new Error(`api-proxy ${path} gagal: ${body.message ?? "unknown"}`);
  }
  return {
    total: Number(body.total ?? body.data.length),
    metadata: body.metadata ?? {},
    items: body.data,
  };
}

export const apiProxyClient = {
  async latest(page = 1, size = 20) {
    return getList(`/drama/latest?page=${page}&size=${size}`);
  },

  async featured(page = 1, size = 20) {
    return getList(`/drama/featured?page=${page}&size=${size}`);
  },

  async rank(type = 1) {
    return getList(`/drama/rank?type=${type}`);
  },

  async fetchAllIndo() {
    return getList(`/drama/fetch-all`, 600_000);
  },

  episodes(bookId: string, timeoutMs?: number) {
    return getEpisodes(bookId, timeoutMs);
  },
};
