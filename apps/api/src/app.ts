import { Hono } from "hono";
import type { ErrorEnvelope, HealthData, SuccessEnvelope } from "@dracin/shared";

export function createApp() {
  const app = new Hono();

  app.onError((err, c) => {
    console.error("[api] unhandled error:", err);
    const body: ErrorEnvelope = {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan internal" },
    };
    return c.json(body, 500);
  });

  app.get("/health", (c) => {
    const body: SuccessEnvelope<HealthData> = {
      success: true,
      data: { status: "ok" },
    };
    return c.json(body);
  });

  return app;
}
