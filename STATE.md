# State — Web Streaming Dracin

Terakhir diupdate: 2026-08-25. **Grill selesai, PRD/PLAN/SPEC + 11 tiket diterbitkan.** Siap eksekusi tiket (mulai dari #01).

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
