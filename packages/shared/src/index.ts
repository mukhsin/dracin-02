import { z } from "zod";

/**
 * Amplop respons standar seluruh API Dracin.
 * Sukses: { success: true, data, meta? } — Error: { success: false, error: { code, message } }
 */

export const apiErrorCodeSchema = z.enum([
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "VALIDATION_ERROR",
  "CONFLICT",
  "RATE_LIMITED",
  "UPSTREAM_ERROR",
  "INTERNAL_ERROR",
]);
export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export const errorBodySchema = z.object({
  code: apiErrorCodeSchema,
  message: z.string(),
});

export const errorEnvelopeSchema = z.object({
  success: z.literal(false),
  error: errorBodySchema,
});
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;

export const metaSchema = z.object({
  /** Sumber data respons: db mirror, cache pendek, atau fetch segar ke upstream. */
  source: z.enum(["db", "cache", "fresh"]).optional(),
});
export type Meta = z.infer<typeof metaSchema>;

/** Bangun skema amplop sukses untuk payload terverifikasi Zod. */
export function successEnvelope<T extends z.ZodType>(data: T) {
  return z.object({
    success: z.literal(true),
    data,
    meta: metaSchema.optional(),
  });
}

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: Meta;
}

export const healthDataSchema = z.object({
  status: z.literal("ok"),
});
export type HealthData = z.infer<typeof healthDataSchema>;

export const dramaStatusSchema = z.enum(["ongoing", "completed"]);
export type DramaStatus = z.infer<typeof dramaStatusSchema>;

/** DTO drama yang dikirim ke client (timestamp ISO string hasil JSON). */
export const dramaSchema = z.object({
  id: z.string(),
  bookId: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  posterUrl: z.string().nullable(),
  genres: z.array(z.string()),
  status: dramaStatusSchema,
  totalEpisodes: z.number().int(),
  playCount: z.string().nullable(),
  featured: z.boolean(),
  featuredOrder: z.number().int().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type DramaDto = z.infer<typeof dramaSchema>;

export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export const dramaListDataSchema = z.object({
  items: z.array(dramaSchema),
  pagination: paginationMetaSchema,
});
export type DramaListData = z.infer<typeof dramaListDataSchema>;

export const genreWithCountSchema = z.object({
  name: z.string(),
  dramaCount: z.number().int().min(0),
});
export type GenreWithCount = z.infer<typeof genreWithCountSchema>;

export const listDramasQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
  genre: z.string().trim().min(1).optional(),
  sort: z.enum(["newest", "popular", "title"]).default("newest"),
});
export type ListDramasQuery = z.infer<typeof listDramasQuerySchema>;
