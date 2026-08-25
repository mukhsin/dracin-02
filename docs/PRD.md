# PRD — Dracin (Web Streaming Drama)

Versi: 1.0 · Tanggal: 2026-08-25 · Status: Disetujui (hasil sesi grilling)

## 1. Latar Belakang & Tujuan

Dracin adalah situs streaming drama (fokus drama Asia/DramaBox berbahasa Indonesia) yang dibangun ulang dari proyek lama `mukhsin/dracin`.

- **Tujuan bisnis**: Proyek pribadi/portofolio — mendemonstrasikan kemampuan full-stack TypeScript modern (monorepo, SPA, API, sinkronisasi data, deployment).
- **Target pengguna**: Penonton drama Indonesia yang ingin menonton gratis lewat web; dan rekruter/kolega developer yang melihat portofolio.

## 2. Masalah

Katalog drama tersebar di aplikasi pihak ketiga yang berat dan penuh iklan. Belum ada satu tempat ringan berbahasa Indonesia untuk menjelajah katalog drama, melihat info lengkap, dan langsung memutar episodenya.

## 3. Solusi

Situs web cepat bertema gelap berbahasa Indonesia penuh:

- **Homepage** kurasi: hero drama unggulan + section unggulan, lalu grid katalog lengkap.
- **Browse** (`/browse`): cari berdasarkan judul, filter genre, urutkan, paginasi.
- **Detail drama** (`/drama/:slug`): poster, sinopsis, genre, status, tombol episode 1..N.
- **Player** (`/watch/:slug/:episode`): pemutar video dengan navigasi prev/next.

Katalog **tidak dikelola manual**: data disinkronkan otomatis dari sumber scraper (api-proxy DramaBox) lewat cron terjadwal; pemain video mengambil URL tayang segar saat ditonton sehingga link selalu hidup.

## 4. Fitur MVP

| # | Fitur | Keterangan |
|---|-------|-----------|
| F1 | Homepage kurasi | Hero featured, section unggulan, grid lengkap |
| F2 | Katalog & paginasi | Grid drama dengan load-more/paginasi |
| F3 | Pencarian | Berdasarkan judul di `/browse` |
| F4 | Filter genre + sortir | Genre dari metadata; sortir terbaru/rating/judul |
| F5 | Detail drama | Metadata lengkap + daftar tombol episode |
| F6 | Player episode | HLS/video, prev-next, judul episode |
| F7 | Sinkronisasi otomatis | Seed awal sekali + cron rutin (upsert, idempoten) |

## 5. Non-Tujuan (Fase 2+)

Akun/login (better-auth), watchlist, riwayat tonton & lanjut tonton, admin panel, katalog multi-bahasa (~4500), SSR/SEO, komentar/rating pengguna, CDN video sendiri.

## 6. Kriteria Sukses

1. Situs live di VPS (via Dokploy), dapat diakses publik dengan domain.
2. Katalog terisi otomatis: seed awal ~865 drama indo; cron memperbarui tanpa intervensi.
3. Pengunjung dapat menyelesaikan alur: buka → jelajah → detail → putar episode → next episode.
4. Kode rapi bertipe penuh (TypeScript end-to-end) sebagai bahan portofolio.
