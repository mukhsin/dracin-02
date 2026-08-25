import type { ErrorEnvelope, HealthData, SuccessEnvelope } from "@dracin/shared";
import { Hono } from "hono";
import { internalRoutes } from "./routes/internal";

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

  app.route("/internal", internalRoutes);

  app.get("/health", (c) => {
    const body: SuccessEnvelope<HealthData> = {
      success: true,
      data: { status: "ok" },
    };
    return c.json(body);
  });

  return app;
}
