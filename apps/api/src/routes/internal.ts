import type { ErrorEnvelope, SuccessEnvelope } from "@dracin/shared";
import { timingSafeEqual } from "node:crypto";
import { Hono } from "hono";
import { env } from "../lib/env";
import { syncIncremental } from "../services/sync.service";

export const internalRoutes = new Hono();

function bearerToken(header: string | undefined): string {
  return header?.startsWith("Bearer ") ? header.slice(7) : "";
}

function secretMatches(token: string): boolean {
  if (!env.cronSecret || !token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(env.cronSecret);
  return a.length === b.length && timingSafeEqual(a, b);
}

internalRoutes.post("/sync", async (c) => {
  if (!secretMatches(bearerToken(c.req.header("Authorization")))) {
    const body: ErrorEnvelope = {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Secret tidak valid" },
    };
    return c.json(body, 401);
  }

  try {
    const result = await syncIncremental();
    console.log(
      `[sync] incremental selesai: latest=${result.latest} featured=${result.featured} rank=${result.rank}`,
    );
    return c.json({ success: true, data: result } satisfies SuccessEnvelope<
      typeof result
    >);
  } catch (err) {
    console.error("[sync] gagal:", err);
    const body: ErrorEnvelope = {
      success: false,
      error: {
        code: "UPSTREAM_ERROR",
        message: "Sinkronisasi ke sumber gagal",
      },
    };
    return c.json(body, 502);
  }
});
