# State — Web Streaming Dracin

Terakhir diupdate: 2026-08-26. **Eksekusi selesai — 11/11 tiket ter-commit & ter-push ke `main`.**

## Status tiket

| # | Tiket | Commit | Verifikasi |
|---|-------|--------|-----------|
| 01 | Scaffold monorepo | 040fed9 | typecheck+smoke test |
| 02 | Port api-proxy | ed5ba28 | struktur jalan (/health OK); **live upstream menunggu SECRET_KEY asli** |
| 03 | Skema DB | c054e40 | migrasi auto-boot terbukti |
| 04 | Sync e2e | 262a21a + 9271cdc | 23 test integrasi lolos (idempoten, guard) |
| 05 | API katalog | 1559efb | test search/genre/sort/paginasi/404 |
| 06 | Episode on-demand | b451da7 | test fresh/cache, prev-next, cache-hit |
| 07 | SPA shell homepage | 31c7033 | build sukses |
| 08 | Browse | fddac7e | URL-driven state |
| 09 | Detail drama | 1b98ff8 | 404 khusus |
| 10 | Player watch | eb3a048 | HLS/native/fallback |
| 11 | Deploy Dokploy | 55d21a3 | **build image belum pernah dijalankan** (lokal tanpa Docker daemon) |

## Sisa langkah manual user

1. Isi `apps/api-proxy/.env` dengan SECRET_KEY DramaBox asli → verifikasi live `/drama/latest`.
2. Deploy ke VPS via `docs/DEPLOY.md`; jalankan sekali `docker compose build` untuk validasi image.
3. Seed awal: `docker compose exec app bun apps/api/src/scripts/sync-full.ts`.
4. Cron Dokploy tiap 6 jam → POST /internal/sync dengan bearer CRON_SECRET.

## Catatan lingkungan dev

- Direname dari `workspace/dracin` → `dracin-02`; shell default cwd kadang basi → selalu set workdir.
- git safe.directory sudah di-add global.
- esbuild binary di node_modules tak punya bit exec (owned uid lain): build web pakai `ESBUILD_BINARY_PATH=/tmp/opencode/bin/esbuild bun run --filter '@dracin/web' build`.

## Deviasi kecil dari spec

- Sortir `rating` diganti `popular` (urut playCount numerik) — upstream DramaBox tidak menyediakan rating.

## Fakta referensi

- Cache docs & kode repo lama: `/tmp/opencode/old-repo-docs/` (API.md, ARCHITECTURE.md, dracin.js, proxy-index.js, token.js).
- URL video upstream: `ch.cdnList[0].videoPathList[0].videoPath || ch.videoUrl`; item episode `index` 0-based.

## Proyek

- Lokasi: `/home/mukhsin/hermes/workspace/dracin-02` (direname dari `dracin` sesuai nama repo)
- Remote (dipakai saat eksekusi dimulai): `https://github.com/mukhsin/dracin-02.git`
- Dokumen: `docs/PRD.md`, `docs/PLAN.md`, `docs/SPEC.md`
- Tiket: `.scratch/dracin-mvp/issues/01..11` (breakdown disetujui user; edges final)

## Keputusan final (semua settle)

| Topik | Keputusan |
|---|---|
| Tujuan | Proyek pribadi/portofolio |
| Struktur | Monorepo **Bun workspaces** (tanpa Turborepo): `apps/web`, `apps/api`, `apps/api-proxy`, `packages/shared` |
| Frontend | Vite + React SPA + TanStack Router (file-based) + TanStack Query |
| Styling | Tailwind v4 + shadcn/ui, dark theme default |
| Backend | Hono, serve build SPA di produksi, no SSR/no SEO |
| Database | SQLite via Drizzle ORM |
| Runtime | Bun |
| Skema | `dramas` (genres kolom JSON, tanpa seasons); **tanpa tabel episodes** di MVP — jumlah episode dari `dramas.totalEpisodes` |
| Sumber data | `apps/api-proxy` (port scraper DramaBox dari repo lama, incl. `token.js`), layanan terpisah port 3002 |
| Sinkronisasi | Cron Dokploy → `POST /internal/sync` (bearer secret). Job ringan: latest + featured + rank upsert. Seed awal manual `sync:full` (~865 indo) |
| Freshness video | URL video TIDAK disimpan; fetch on-demand saat buka player lewat API kita, cache TTL pendek |
| Player | `<video>` + hls.js bila `.m3u8`; prev/next navigation |
| Konten | Drama Indo saja (~865) |
| UI | Bahasa Indonesia penuh; path English (`/browse`, `/drama/:slug`, `/watch/:slug/:episode`) |
| Homepage | Hero featured + section unggulan atas, grid lengkap bawah |
| Search & filter | Halaman `/browse` |
| Deployment | VPS + docker-compose via Dokploy |
| Ditunda fase 2 | Auth (better-auth), watchlist, history/continue-watching, admin panel |

## Rangkuman yang menunggu konfirmasi

Sudah dipresentasikan ke user (round final):
1. Skema `dramas`: id, bookId (unique), slug (unique), title, description, posterUrl, genres JSON, status, totalEpisodes, playCount, featured + featuredOrder, timestamps.
2. API baru: `GET /api/dramas` (pagination/search/genre/sort), `/featured`, `/genres` (count dihitung), `/:slug`, `/:slug/episodes/:number` (on-demand), `POST /internal/sync`, `GET /health`.
3. Env: `PORT`, `DB_PATH`, `API_PROXY_URL`, `CRON_SECRET`. Dev: web 5173, api 3001, proxy 3002; Vite proxy ke API.
4. `packages/shared`: tipe + skema Zod respons API.
5. Git init di `workspace/dracin`.

## Fakta referensi

- Cache docs & kode repo lama: `/tmp/opencode/old-repo-docs/` (API.md, ARCHITECTURE.md, dracin.js, proxy-index.js).
- URL video upstream: `ch.cdnList[0].videoPathList[0].videoPath || ch.videoUrl`; ada logika refresh token (SECRET_KEY).
- Repo lama pakai pola HEAD-validation untuk URL video — jadi acuan desain on-demand.
