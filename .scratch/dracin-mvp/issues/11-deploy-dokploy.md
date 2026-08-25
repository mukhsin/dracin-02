# 11: Docker compose + deployment Dokploy

**What to build:** Kemasan produksi dan rilis ke VPS: image multi-stage per app (base oven/bun), compose berisi layanan API-yang-menyajikan-SPA dan api-proxy dengan volume SQLite persisten, health check gating, serta dokumentasi langkah deploy Dokploy termasuk setup cron sinkronisasi tiap 6 jam dan seed awal pertama kali.

**Blocked by:** 04, 10

**Status:** ready-for-agent

- [ ] Build image tiap app sukses dari compose (multi-stage, ukuran wajar)
- [ ] Compose up menjalankan seluruh sistem; SQLite persisten di volume; /health dipakai healthcheck
- [ ] Situs dapat diakses publik dari VPS melalui domain (Dokploy)
- [ ] Dokumen deploy: env vars, cron Dokploy tiap 6 jam memanggil internal sync dengan bearer, langkah seed awal
