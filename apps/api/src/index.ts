import { createApp } from "./app";

const app = createApp();

const port = Number(process.env.PORT ?? 3001);

const server = Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`[api] listening on http://localhost:${server.port}`);
