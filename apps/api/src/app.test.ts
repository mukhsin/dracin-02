import { beforeAll, describe, expect, test } from "bun:test";
import { rmSync } from "node:fs";

/**
 * Suite integrasi satu proses: env di-set sekali sebelum dynamic import
 * karena modul db singleton ter-cache lintas file test.
 * Test berjalan berurutan sesuai deklarasi.
 */
describe("integrasi API Dracin", () => {
  let app!: ReturnType<(typeof import("./app"))["createApp"]>;
  let createApp: typeof import("./app").createApp;
  let sqlite!: import("bun:sqlite").Database;

  const upstream = {
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
      { bookId: "42000000002", title: "Drama Uji Dua", chapterCount: 5 },
    ],
  };

  let stub: ReturnType<typeof Bun.serve>;

  beforeAll(async () => {
    const tmpDb = `/tmp/opencode/dracin-api-${Date.now()}.db`;
    rmSync(tmpDb, { force: true });
    process.env.DB_PATH = tmpDb;
    process.env.CRON_SECRET = "rahasia-coba";

    stub = Bun.serve({
      port: 0,
      fetch: (req) => {
        const path = new URL(req.url).pathname;
        if (["/drama/latest", "/drama/featured", "/drama/rank"].includes(path)) {
          return Response.json(upstream);
        }
        if (path === "/drama/fetch-all") {
          return Response.json({ ...upstream, total: upstream.data.length });
        }
        return new Response("not found", { status: 404 });
      },
    });
    process.env.API_PROXY_URL = `http://localhost:${stub.port}`;

    const { db } = await import("./db");
    const { migrate } = await import("drizzle-orm/bun-sqlite/migrator");
    migrate(db, {
      migrationsFolder: new URL("../drizzle", import.meta.url).pathname,
    });

    ({ createApp } = await import("./app"));
    app = createApp();
    ({ sqlite } = await import("./db"));
  });

  const countRows = () =>
    sqlite.query<{ n: number }, []>("SELECT COUNT(*) AS n FROM dramas").get()
      ?.n ?? 0;

  describe("POST /internal/sync", () => {
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
        headers: { Authorization: "Bearer bukan-ini" },
      });
      expect(res.status).toBe(401);
    });

    test("secret benar -> sync jalan & mengisi katalog", async () => {
      const res = await app.request("/internal/sync", {
        method: "POST",
        headers: { Authorization: "Bearer rahasia-coba" },
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.data.latest).toBe(2);
      expect(countRows()).toBe(2);
    });
  });

  describe("sync.service", () => {
    test("incremental idempoten saat diulang", async () => {
      const { syncIncremental } = await import("./services/sync.service");
      const r = await syncIncremental();
      expect(r.latest).toBe(2);
      expect(countRows()).toBe(2);
    });

    test("featured mendapat flag dan urutan", () => {
      const row = sqlite
        .query<{ featured: number; featured_order: number }, [string]>(
          "SELECT featured, featured_order FROM dramas WHERE book_id = ?",
        )
        .get("42000000001");
      expect(row?.featured).toBe(1);
      expect(row?.featured_order).toBe(0);
    });

    test("slug deterministik dan ramah URL", () => {
      const row = sqlite
        .query<{ slug: string }, [string]>(
          "SELECT slug FROM dramas WHERE book_id = ?",
        )
        .get("42000000001");
      expect(row?.slug).toBe("drama-uji-satu-000001");
    });

    test("judul berubah di upstream ikut ter-update", async () => {
      upstream.data[0]!.title = "Drama Uji Satu Revisi";
      const { syncIncremental } = await import("./services/sync.service");
      await syncIncremental();
      const row = sqlite
        .query<{ title: string }, [string]>(
          "SELECT title FROM dramas WHERE book_id = ?",
        )
        .get("42000000001");
      expect(row?.title).toBe("Drama Uji Satu Revisi");
      expect(countRows()).toBe(2);

      upstream.data[0]!.title = "Drama Uji Satu";
      await syncIncremental();
    });

    test("full seed menarik seluruh katalog", async () => {
      const { syncFull } = await import("./services/sync.service");
      const r = await syncFull();
      expect(r.total).toBe(2);
      expect(countRows()).toBe(2);
    });
  });

  describe("GET /api/dramas*", () => {
    beforeAll(async () => {
      const old = new Date("2024-01-01T00:00:00Z");
      const newer = new Date("2025-06-01T00:00:00Z");
      const { db } = await import("./db");
      const { dramas } = await import("./db/schema");
      await db.insert(dramas).values([
        {
          bookId: "B1",
          slug: "cinta-terlarang-b1",
          title: "Cinta Terlarang",
          description: "Kisah cinta dua dunia",
          genres: ["Romance"],
          status: "ongoing" as const,
          totalEpisodes: 16,
          playCount: "900K",
          featured: true,
          featuredOrder: 2,
          createdAt: old,
          updatedAt: old,
        },
        {
          bookId: "B2",
          slug: "pendekar-emas-b2",
          title: "Pendekar Emas",
          description: "Aksi bela diri",
          genres: ["Action", "Romance"],
          status: "completed" as const,
          totalEpisodes: 24,
          playCount: "12.5M",
          featured: true,
          featuredOrder: 1,
          createdAt: newer,
          updatedAt: newer,
        },
        {
          bookId: "B3",
          slug: "tawa-terakhir-b3",
          title: "Tawa Terakhir",
          genres: ["Comedy"],
          totalEpisodes: 8,
          playCount: "3M",
          createdAt: old,
          updatedAt: old,
        },
        {
          bookId: "B4",
          slug: "rumah-misteri-b4",
          title: "Rumah Misteri",
          description: "Horor paranormal di perkampungan",
          genres: [],
          totalEpisodes: 5,
          createdAt: newer,
          updatedAt: newer,
        },
      ]);
    });

    test("list default: envelope + paginasi benar", async () => {
      const res = await app.request("/api/dramas");
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.items.length).toBe(6);
      expect(body.data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 6,
        totalPages: 1,
      });
    });

    test("search mencocokkan judul", async () => {
      const body = await (
        await app.request("/api/dramas?search=cinta")
      ).json();
      expect(body.data.items.map((d: { title: string }) => d.title)).toEqual([
        "Cinta Terlarang",
      ]);
    });

    test("search mencocokkan deskripsi", async () => {
      const body = await (
        await app.request("/api/dramas?search=paranormal")
      ).json();
      expect(body.data.items.length).toBe(1);
      expect(body.data.items[0].slug).toBe("rumah-misteri-b4");
    });

    test("filter genre dari kolom JSON", async () => {
      const body = await (await app.request("/api/dramas?genre=romance")).json();
      expect(body.data.items.length).toBe(2);
    });

    test("sort=title urut alfabetis tanpa peduli huruf besar", async () => {
      const body = await (
        await app.request("/api/dramas?sort=title&limit=10")
      ).json();
      expect(body.data.items.map((d: { title: string }) => d.title)).toEqual([
        "Cinta Terlarang",
        "Drama Uji Dua",
        "Drama Uji Satu",
        "Pendekar Emas",
        "Rumah Misteri",
        "Tawa Terakhir",
      ]);
    });

    test("sort=popular memprioritaskan jumlah tayang tertinggi", async () => {
      const body = await (await app.request("/api/dramas?sort=popular")).json();
      expect(body.data.items[0].slug).toBe("pendekar-emas-b2");
    });

    test("paginasi halaman 2 sisa baris + meta benar", async () => {
      const body = await (
        await app.request("/api/dramas?page=2&limit=4")
      ).json();
      expect(body.data.items.length).toBe(2);
      expect(body.data.pagination.totalPages).toBe(2);
    });

    test("featured urut featuredOrder", async () => {
      const body = await (await app.request("/api/dramas/featured")).json();
      expect(body.data.items.map((d: { slug: string }) => d.slug)).toEqual([
        "pendekar-emas-b2",
        "cinta-terlarang-b1",
      ]);
    });

    test("genres menghitung drama per genre", async () => {
      const body = await (await app.request("/api/dramas/genres")).json();
      const romance = body.data.find(
        (g: { name: string }) => g.name === "Romance",
      );
      expect(romance.dramaCount).toBe(2);
    });

    test("detail by slug; slug tak dikenal 404", async () => {
      const ok = await app.request("/api/dramas/pendekar-emas-b2");
      const okBody = await ok.json();
      expect(okBody.data.bookId).toBe("B2");

      const miss = await app.request("/api/dramas/tak-ada");
      expect(miss.status).toBe(404);
      const missBody = await miss.json();
      expect(missBody.error.code).toBe("NOT_FOUND");
    });
  });
});
