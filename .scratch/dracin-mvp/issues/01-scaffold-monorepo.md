# 01: Scaffold monorepo + paket shared kontrak API

**What to build:** Fondasi monorepo Bun workspaces yang hidup: aplikasi web (Vite + React + TanStack Router file-based + TanStack Query) dan aplikasi API (Hono) bisa dijalankan, plus paket shared berisi skema Zod kontrak respons API (`{ success, data, meta? }` / `{ error: { code, message } }`) yang diimpor kedua sisi.

**Blocked by:** None (can start immediately). Saat mulai, init git dan hubungkan ke remote `https://github.com/mukhsin/dracin-02.git`.

**Status:** ready-for-agent

- [ ] `bun install` di root berhasil; semua workspace ter-link
- [ ] Dev server web dan API bisa dijalankan dari root; Vite mem-proxy `/api` ke port API
- [ ] Paket shared mengekspor skema Zod dasar (amplop sukses/error) dan tipe turunannya
- [ ] API punya `GET /health`; typecheck lolos di seluruh monorepo
