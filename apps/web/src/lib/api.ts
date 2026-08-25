import { dramaListDataSchema, dramaSchema, successEnvelope } from "@dracin/shared";
import type { DramaDto } from "@dracin/shared";
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
}

export async function fetchDramas(params: FetchDramasParams = {}) {
  const { page = 1, limit = 24 } = params;
  const search = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const envelope = await fetchJson(
    `/api/dramas?${search.toString()}`,
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
