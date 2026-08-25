# Plan Teknis — Dracin

Versi: 1.0 · Tanggal: 2026-08-25

## 1. Arsitektur

Monorepo **Bun workspaces** (tanpa Turborepo):

```
apps/web         Vite + React SPA · TanStack Router (file-based) + TanStack Query
                 Tailwind v4 + shadcn/ui · dark theme default · UI bahasa Indonesia
apps/api         Hono + Zod · Drizzle ORM · SQLite file · serve build SPA di produksi
apps/api-proxy   Scraper DramaBox (port dari repo lama: dracin.js + token.js), port 3002
packages/shared  Tipe TypeScript + skema Zod kontrak API (dipakai web & api)
```

- No SSR, no SEO — SPA murni. Di produksi satu origin: Hono menyajikan `dist/` SPA + `/api/*`.
- Dev ports: web 5173 (Vite proxy `/api` → 3001), api 3001, api-proxy 3002.

## 2. Database (SQLite via Drizzle)

Satu tabel inti:

```
dramas: id (uuid), bookId (unique, ID DramaBox), slug (unique), title,
        description, posterUrl, genres (JSON array of string),
        status (ongoing|completed), totalEpisodes (int), playCount (text/int),
        featured (bool), featuredOrder (int?), createdAt, updatedAt
```

- **Tanpa tabel seasons** (DramaBox umumnya single-season) dan **tanpa tabel episodes** di MVP — jumlah episode cukup dari `totalEpisodes`.
- Index: `slug`, `bookId`, `status`, `featured`.

## 3. Aliran Data

### Sinkronisasi katalog (cron Dokploy → apps/api)
1. Seed awal (sekali, manual): perintah `sync:full` menarik `GET /drama/fetch-all` (~865 indo) dari api-proxy → upsert massal.
2. Rutin: cron Dokploy tiap 6 jam (env-configurable) memanggil `POST /internal/sync` (guard bearer `CRON_SECRET`) → tarik `/drama/latest` + `/drama/featured` (+ rank) → upsert by `bookId` (idempoten).

### URL video on-demand (tidak pernah disimpan)
Saat user membuka player, `apps/api` memanggil api-proxy `GET /drama/episodes/:bookId`, ambil episode ke-N (`cdnList[0].videoPathList[0].videoPath || videoUrl`), bungkus dengan navigasi prev/next, respons ditandai `meta.source`. Cache in-memory TTL pendek. Alasan: URL DramaBox cepat kedaluwarsa (pola terbukti di repo lama yang memakai HEAD-validation + fresh fetch).

## 4. Kontrak API

| Endpoint | Fungsi |
|---|---|
| `GET /api/dramas?page&limit&search&genre&sort` | Katalog: paginasi, cari judul/deskripsi, filter genre, sort `newest\|rating\|title` |
| `GET /api/dramas/featured?limit` | Drama unggulan (hero & section) |
| `GET /api/dramas/genres` | Daftar genre + jumlah drama (dihitung dari JSON) |
| `GET /api/dramas/:slug` | Detail drama |
| `GET /api/dramas/:slug/episodes/:number` | Data episode + URL video segar + prev/next |
| `POST /internal/sync` | Trigger sinkronisasi (bearer secret) |
| `GET /health` | Health check Dokploy |

Konvensi respons: `{ success, data, meta? }`; error `{ error: { code, message } }`. Skema Zod untuk semua respons disimpan di `packages/shared` sehingga client type-safe.

## 5. Halaman SPA

| Route | Isi |
|---|---|
| `/` | Hero featured + section unggulan; grid lengkap di bawah (paginasi/load-more) |
| `/browse` | Search bar + chip genre + sortir + grid hasil paginasi |
| `/drama/:slug` | Poster, sinopsis, genre, status, tahun?, tombol episode 1..N |
| `/watch/:slug/:episode` | Player (`<video>` + hls.js bila `.m3u8`), judul, prev/next |

State server sepenuhnya TanStack Query (staleTime wajar, retry ringan); state UI lokal React.

## 6. Konfigurasi & Lingkungan

Env `apps/api`: `PORT`, `DB_PATH`, `API_PROXY_URL`, `CRON_SECRET`, `SYNC_INTERVAL_HOURS`.
Env `apps/api-proxy`: `PORT`, `SECRET_KEY` (private key DramaBox, port dari `.env.example` lama).

## 7. Deployment (VPS + Docker Compose via Dokploy)

- Dockerfile multi-stage per app (base `oven/bun`).
- Compose: `web+api` (satu proses Hono), `api-proxy`; volume SQLite persisten.
- Cron Dokploy: `curl -X POST -H "Authorization: Bearer $CRON_SECRET" .../internal/sync` tiap 6 jam.
- Health check `/health` sebagai gating restart.

## 8. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| URL video kedaluwarsa | Fetch on-demand + cache TTL pendek (keputusan #30) |
| api-proxy gagal/token expired | Port logika refresh token utuh; error jelas + meta.source |
| Sync duplikat/race | Upsert idempoten by `bookId` |
| Upstream berubah format | Scraper terlokalisasi di satu app; transform terpusat |
| SQLite concurrent write | Satu penulis (proses api), volume tunggal — skala personal aman |

## 9. Fase 2 Backlog

better-auth (+OTP), watchlist, history/continue-watching (progress 10s, complete ≥90%), admin panel sederhana, katalog multi-bahasa.
