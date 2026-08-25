/**
 * Env terpusat — dibaca sekali saat modul dimuat.
 * Test mengisi process.env sebelum dynamic import.
 */
export const env = {
  port: Number(process.env.PORT ?? 3001),
  dbPath: process.env.DB_PATH ?? ".data/dracin.db",
  apiProxyUrl: process.env.API_PROXY_URL ?? "http://localhost:3002",
  cronSecret: process.env.CRON_SECRET ?? "",
  episodeCacheTtlMs: Number(process.env.EPISODE_CACHE_TTL_MS ?? 60_000),
};
