import {
  dramaListDataSchema,
  dramaSchema,
  genreWithCountSchema,
  successEnvelope,
} from "@dracin/shared";
import type { DramaDto, GenreWithCount } from "@dracin/shared";
import { z } from "zod";

const BASE_URL = "";

/** Skema respons /api/dramas/featured — didefinisikan lokal (belum ada di shared). */
const featuredResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(dramaSchema),
  }),
});

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchJson<Schema extends z.ZodType>(
  path: string,
  schema: Schema,
): Promise<z.output<Schema>> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new ApiError(`Permintaan gagal (${response.status})`, response.status);
  }
  const body: unknown = await response.json();
  return schema.parse(body);
}

export interface FetchDramasParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  sort?: "newest" | "popular" | "title";
}

export async function fetchDramas(params: FetchDramasParams = {}) {
  const { page = 1, limit = 24, search, genre, sort } = params;
  const search_ = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (search) search_.set("search", search);
  if (genre) search_.set("genre", genre);
  if (sort && sort !== "newest") search_.set("sort", sort);
  const envelope = await fetchJson(
    `/api/dramas?${search_.toString()}`,
    successEnvelope(dramaListDataSchema),
  );
  return envelope.data;
}

export async function fetchFeatured(limit = 10): Promise<DramaDto[]> {
  const search = new URLSearchParams({ limit: String(limit) });
  const envelope = await fetchJson(
    `/api/dramas/featured?${search.toString()}`,
    featuredResponseSchema,
  );
  return envelope.data.items;
}

export async function fetchGenres(): Promise<GenreWithCount[]> {
  const envelope = await fetchJson(
    "/api/dramas/genres",
    z.object({
      success: z.literal(true),
      data: z.array(genreWithCountSchema),
    }),
  );
  return envelope.data;
}

export async function fetchDramaBySlug(slug: string): Promise<DramaDto> {
  const envelope = await fetchJson(
    `/api/dramas/${encodeURIComponent(slug)}`,
    successEnvelope(dramaSchema),
  );
  return envelope.data;
}

import { episodeDataSchema } from "@dracin/shared";
import type { EpisodeDataDto } from "@dracin/shared";

/** Respons /api/dramas/{slug}/episodes/{number} — didefinisikan lokal di web (meta.source opsional). */
const episodeResponseSchema = z.object({
  success: z.literal(true),
  data: episodeDataSchema,
  meta: z.object({ source: z.string() }).optional(),
});

export async function fetchEpisode(
  slug: string,
  number: number,
): Promise<EpisodeDataDto> {
  const envelope = await fetchJson(
    `/api/dramas/${encodeURIComponent(slug)}/episodes/${encodeURIComponent(String(number))}`,
    episodeResponseSchema,
  );
  return envelope.data;
}
