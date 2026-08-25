import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { createApp } from "./app";
import { db } from "./db";

// Terapkan migrasi otomatis saat boot supaya deploy tinggal jalan.
migrate(db, { migrationsFolder: `${import.meta.dir}/../drizzle` });

const app = createApp();

const port = Number(process.env.PORT ?? 3001);

const server = Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`[api] listening on http://localhost:${server.port}`);
