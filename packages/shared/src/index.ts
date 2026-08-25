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
