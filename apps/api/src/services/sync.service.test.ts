import { beforeAll, describe, expect, test } from "bun:test";
import type { Database as BunDatabase } from "bun:sqlite";
import { rmSync } from "node:fs";

describe("sync.service", () => {
  let syncIncremental: typeof import("./sync.service").syncIncremental;
  let syncFull: typeof import("./sync.service").syncFull;
  let db: import("../db").db;
  let sqlite: BunDatabase;

  const payload = {
    status: true,
    data: [
      {
        bookId: "42000000001",
        title: "Drama Uji Satu",
        cover: "https://contoh.id/1.jpg",
        intro: "Sinopsis satu",
        chapterCount: 10,
        playCount: "1.2M",
      },
      {
        bookId: "42000000002",
        title: "Drama Uji Dua",
        chapterCount: 5,
      },
    ],
  };

  beforeAll(async () => {
    const tmpDb = `/tmp/opencode/dracin-sync-${Date.now()}.db`;
    rmSync(tmpDb, { force: true });
    process.env.DB_PATH = tmpDb;

    const stub = Bun.serve({
      port: 0,
      fetch: (req) => {
        const path = new URL(req.url).pathname;
        if (
          ["/drama/latest", "/drama/featured", "/drama/rank"].includes(path)
        ) {
          return Response.json(payload);
        }
        if (path === "/drama/fetch-all") {
          return Response.json({ ...payload, total: payload.data.length });
        }
        return new Response("not found", { status: 404 });
      },
    });
    process.env.API_PROXY_URL = `http://localhost:${stub.port}`;

    ({ db, sqlite } = await import("../db"));
    const { migrate } = await import("drizzle-orm/bun-sqlite/migrator");
    migrate(db, {
      migrationsFolder: new URL("../../drizzle", import.meta.url).pathname,
    });
    ({ syncIncremental, syncFull } = await import("./sync.service"));
  });

  function countRows(): number | undefined {
    return sqlite
      .query<{ n: number }, []>("SELECT COUNT(*) AS n FROM dramas")
      .get()?.n;
  }

  test("incremental mengisi katalog dan idempoten saat diulang", async () => {
    const r1 = await syncIncremental();
    expect(r1.latest).toBe(2);
    expect(r1.featured).toBe(2);
    expect(r1.rank).toBe(2);

    await syncIncremental();
    expect(countRows()).toBe(2);
  });

  test("featured mendapat flag dan urutan", () => {
    const row = sqlite
      .query<
        { featured: number; featured_order: number | null },
        [string]
      >(
        "SELECT featured, featured_order FROM dramas WHERE book_id = ? ORDER BY featured_order",
      )
      .get("42000000001");
    expect(row?.featured).toBe(1);
    expect(row?.featured_order).toBe(0);
  });

  test("slug deterministik dan ramah URL", () => {
    const row = sqlite
      .query<{ slug: string }, []>("SELECT slug FROM dramas WHERE book_id = ?")
      .get("42000000001");
    expect(row?.slug).toBe("drama-uji-satu-000001");
  });

  test("full seed menarik seluruh katalog", async () => {
    const r = await syncFull();
    expect(r.total).toBe(2);
    expect(countRows()).toBe(2);
  });

  test("judul berubah di upstream ikut ter-update (upsert)", async () => {
    payload.data[0]!.title = "Drama Uji Satu Revisi";
    await syncIncremental();
    const row = sqlite
      .query<{ title: string }, []>(
        "SELECT title FROM dramas WHERE book_id = ?",
      )
      .get("42000000001");
    expect(row?.title).toBe("Drama Uji Satu Revisi");
    expect(countRows()).toBe(2);
  });
});
