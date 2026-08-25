import type { EpisodeDataDto } from "@dracin/shared";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { dramas } from "../db/schema";
import { env } from "../lib/env";
import {
  apiProxyClient,
  type UpstreamEpisodesMetadata,
  type UpstreamEpisodesResult,
} from "./api-proxy.client";

type UpstreamDramaRow = typeof dramas.$inferSelect;

interface CacheEntry {
  expiresAt: number;
  result: UpstreamEpisodesResult;
}

/** Cache in-memory pendek per bookId: buka ulang dalam TTL tidak menyentuh upstream. */
const episodeCache = new Map<string, CacheEntry>();

export type EpisodeSource = "fresh" | "cache";

export type EpisodeResult =
  | { ok: true; data: EpisodeDataDto; source: EpisodeSource }
  | { ok: false; reason: "drama-not-found" | "episode-out-of-range" };

async function getUpstream(
  bookId: string,
): Promise<{ result: UpstreamEpisodesResult; source: EpisodeSource }> {
  const cached = episodeCache.get(bookId);
  if (cached && cached.expiresAt > Date.now()) {
    return { result: cached.result, source: "cache" };
  }
  const result = await apiProxyClient.episodes(bookId);
  episodeCache.set(bookId, {
    expiresAt: Date.now() + env.episodeCacheTtlMs,
    result,
  });
  return { result, source: "fresh" };
}

/**
 * Enrichment fire-and-forget dari metadata proxy: isi kolom kosong saja.
 * Dipanggil tanpa await; kegagalan ditelan agar tak pernah memengaruhi respons.
 */
function enrichFromMetadata(
  bookId: string,
  current: UpstreamDramaRow,
  metadata: UpstreamEpisodesMetadata,
  upstreamTotal: number,
): void {
  const set: Partial<typeof dramas.$inferInsert> = {};
  if (!current.description && metadata.intro) {
    set.description = String(metadata.intro);
  }
  if (!current.posterUrl && metadata.cover) {
    set.posterUrl = String(metadata.cover);
  }
  if (upstreamTotal > 0 && upstreamTotal !== current.totalEpisodes) {
    set.totalEpisodes = upstreamTotal;
  }
  if (Object.keys(set).length === 0) return;

  void (async () => {
    try {
      await db
        .update(dramas)
        .set({ ...set, updatedAt: new Date() })
        .where(eq(dramas.bookId, bookId));
    } catch (err) {
      console.error(`[episode] enrichment ${bookId} gagal:`, err);
    }
  })();
}

export const episodeService = {
  async getEpisode(slug: string, numberParam: string): Promise<EpisodeResult> {
    const row = await db
      .select()
      .from(dramas)
      .where(eq(dramas.slug, slug))
      .get();
    if (!row) return { ok: false, reason: "drama-not-found" };

    const number = Number(numberParam);
    if (
      !Number.isInteger(number) ||
      number < 1 ||
      number > Math.max(row.totalEpisodes, 0)
    ) {
      return { ok: false, reason: "episode-out-of-range" };
    }

    const { result, source } = await getUpstream(row.bookId);

    // Item upstream ber-index 0-based; nomor user 1-based (index === number - 1).
    const item = result.items.find((ep) => ep.index === number - 1);

    enrichFromMetadata(row.bookId, row, result.metadata, result.total);

    const data: EpisodeDataDto = {
      drama: {
        slug: row.slug,
        title: row.title,
        totalEpisodes: row.totalEpisodes,
      },
      episode: {
        number,
        videoUrl: item?.url ? String(item.url) : null,
      },
      navigation: {
        prevNumber: number > 1 ? number - 1 : null,
        nextNumber: number < row.totalEpisodes ? number + 1 : null,
      },
    };
    return { ok: true, data, source };
  },
};
