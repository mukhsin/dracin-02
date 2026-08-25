import { beforeAll, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";

describe("POST /internal/sync guard", () => {
  let app!: ReturnType<(typeof import("../app"))["createApp"]>;
  let createApp: typeof import("../app").createApp;

  beforeAll(async () => {
    const tmpDb = `/tmp/opencode/dracin-guard-${Date.now()}.db`;
    rmSync(tmpDb, { force: true });
    process.env.DB_PATH = tmpDb;
    process.env.CRON_SECRET = "rahasia-coba";
    process.env.API_PROXY_URL = "http://localhost:1";

    ({ createApp } = await import("../app"));
    const { db } = await import("../db");
    const { migrate } = await import("drizzle-orm/bun-sqlite/migrator");
    migrate(db, {
      migrationsFolder: new URL("../../drizzle", import.meta.url).pathname,
    });
    app = createApp();
  });

  test("tanpa secret -> 401 format error standar", async () => {
    const res = await app.request("/internal/sync", { method: "POST" });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  test("secret salah -> 401", async () => {
    const res = await app.request("/internal/sync", {
      method: "POST",
      headers: { Authorization: "Bearer salah-benar-toh" },
    });
    expect(res.status).toBe(401);
  });
});
