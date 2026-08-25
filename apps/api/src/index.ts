import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { serveStatic } from "hono/bun";
import { createApp } from "./app";
import { db } from "./db";

migrate(db, { migrationsFolder: `${import.meta.dir}/../drizzle` });

const app = createApp();

if (process.env.SERVE_SPA === "1") {
  const distDir = process.env.WEB_DIST_DIR ?? "apps/web/dist";
  app.use("*", serveStatic({ root: distDir }));
  app.get("*", serveStatic({ path: `${distDir}/index.html` }));
}

const port = Number(process.env.PORT ?? 3001);

const server = Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`[api] listening on http://localhost:${server.port}`);
