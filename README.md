# Dracin

Situs streaming drama berbahasa Indonesia. Monorepo Bun workspaces:

- `apps/web` — Vite + React SPA (TanStack Router + Query)
- `apps/api` — Hono + Drizzle (SQLite), serve SPA di produksi
- `apps/api-proxy` — scraper DramaBox (port dari repo lama)
- `packages/shared` — kontrak API (Zod)

## Dev

```bash
bun install
bun dev        # api :3001 + web :5173 (proxy /api)
```

## Scripts root

| Script | Fungsi |
|---|---|
| `bun dev` | Jalankan web + api bersamaan |
| `bun run build` | Build semua workspace |
| `bun run typecheck` | Typecheck semua workspace |

Dokumen: `docs/PRD.md`, `docs/PLAN.md`, `docs/SPEC.md`. Tiket: `.scratch/dracin-mvp/issues/`.
