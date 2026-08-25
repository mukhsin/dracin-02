# Spec — Dracin MVP

Versi: 1.0 · Tanggal: 2026-08-25 · Sumber: sesi grilling (lihat `STATE.md`) · PRD: `docs/PRD.md` · Plan: `docs/PLAN.md`

## Problem Statement

Penonton drama Indonesia harus membuka aplikasi pihak ketiga yang berat dan penuh iklan untuk menjelajah katalog drama dan menonton. Tidak ada satu tempat web yang ringan, cepat, berbahasa Indonesia penuh untuk: melihat kurasi drama unggulan, mencari/menyaring katalog, membaca info drama, dan langsung memutar episodenya. Pemilik situs juga tidak mau mengelola katalog manual — data harus datang sendiri dari sumbernya.

## Solution

Situs streaming SPA bertema gelap berbahasa Indonesia. Katalog disinkronkan otomatis dari scraper DramaBox (api-proxy) lewat cron: seed awal sekali (~865 drama indo), lalu pembaruan rutin idempoten. URL tayang tidak pernah disimpan di database — selalu diambil segar saat episode ditonton sehingga link mati tak terjadi. Pemain video mendukung HLS dengan navigasi antar-episode.

## User Stories

Pengunjung — penjelajahan:
1. Sebagai pengunjung, saya ingin melihat hero drama unggulan di homepage, supaya langsung terpancing menonton konten populer.
2. Sebagai pengunjung, saya ingin melihat section drama unggulan berupa deretan kartu, supaya punya banyak pilihan cepat tanpa scroll jauh.
3. Sebagai pengunjung, saya ingin melihat grid katalog lengkap di bagian bawah homepage, supaya bisa menggali konten lain.
4. Sebagai pengunjung, saya ingin memuat halaman katalog berikutnya (paginasi/load-more), supaya eksplorasi katalog besar nyaman.
5. Sebagai pengunjung, saya ingin kartu drama menampilkan poster, judul, genre singkat, dan jumlah episode, supaya bisa menilai minat sekali lirik.

Pengunjung — pencarian & filter:
6. Sebagai pengunjung, saya ingin mencari drama berdasarkan judul di halaman browse, supaya menemukan drama tertentu dengan cepat.
7. Sebagai pengunjung, saya ingin memfilter katalog per genre, supaya hanya melihat tipe drama yang saya suka.
8. Sebagai pengunjung, saya ingin mengurutkan hasil (terbaru/rating/judul), supaya daftar tersusun sesuai preferensi saya.
9. Sebagai pengunjung, saya ingin melihat pesan ramah saat pencarian tanpa hasil, supaya tahu harus mencoba kata kunci lain.
10. Sebagai pengunjung, saya ingin URL browse mencerminkan state filter/pencarian, supaya bisa membagikan atau menyimpan tautan hasil.

Pengunjung — detail & pemutaran:
11. Sebagai pengunjung, saya ingin membuka halaman detail dari kartu drama, supaya bisa membaca sinopsis dan info lengkap.
12. Sebagai pengunjung, saya ingin melihat poster, sinopsis, genre, status tayang, dan jumlah episode di halaman detail, supaya punya gambaran utuh sebelum menonton.
13. Sebagai pengunjung, saya ingin tombol episode 1..N di halaman detail, supaya bisa memilih episode mana pun langsung.
14. Sebagai pengunjung, saya ingin memutar episode di halaman player, supaya menonton tanpa keluar situs.
15. Sebagai pengunjung, saya ingin navigasi episode sebelumnya/berikutnya di player, supaya binge-watching mulus.
16. Sebagai pengunjung, saya ingin melihat judul/nomor episode yang sedang diputar, supaya tahu posisi saya dalam serial.
17. Sebagai pengunjung, saya ingin player tetap berfungsi walau link sumber segar harus diambil dulu, supaya pengalaman tidak terasa "rusak" (cukup loading wajar).

Semua pengguna — kualitas:
18. Sebagai pengunjung, saya ingin skeleton/loading state saat data dimuat, supaya situs terasa responsif.
19. Sebagai pengunjung, saya ingin pesan error yang bisa di-retry saat API gagal, supaya tidak mentok layar kosong.
20. Sebagai pengguna ponsel, saya ingin layout responsif sampai ukuran kecil, supaya nyaman menonton di mana saja.
21. Sebagai pengunjung, saya ingin seluruh label UI berbahasa Indonesia, supaya mudah dipahami.
22. Sebagai pengunjung, saya ingin tema gelap sebagai default, supaya nyaman menonton lama.

Operator (pemilik situs):
23. Sebagai operator, saya ingin mengisi katalog awal dengan satu perintah, supaya situs langsung punya isi saat pertama deploy.
24. Sebagai operator, saya ingin katalog terbarui otomatis terjadwal via cron, supaya tidak ada kerja manual rutin.
25. Sebagai operator, saya ingin endpoint sinkronisasi terlindungi secret, supanya tidak bisa dipicu orang luar.
26. Sebagai operator, saya ingin sinkronisasi idempoten (tidak membuat duplikat), supaya database tetap bersih kapan pun dijalankan.
27. Sebagai operator, saya ingin health check endpoint, supaya Dokploy bisa memantau dan me-restart layar secara andal.
28. Sebagai operator, saya ingin log ringkas tiap operasi sinkronisasi, supaya gampang mendiagnosis kalau data macet.

## Implementation Decisions

Keputusan final dari sesi grilling (rincian teknis lengkap di `docs/PLAN.md`):

- **Monorepo Bun workspaces** tanpa Turborepo: aplikasi web SPA, aplikasi API Hono, aplikasi api-proxy (port scraper DramaBox dari repo lama, termasuk logika token), dan paket shared untuk kontrak API.
- **Frontend**: Vite + React + TanStack Router file-based + TanStack Query; Tailwind v4 + shadcn/ui; dark default; UI Indonesia; path English (`/browse`, `/drama/:slug`, `/watch/:slug/:episode`).
- **Backend**: Hono + Zod; SQLite via Drizzle; di produksi proses API menyajikan build SPA (satu origin, no SSR/no SEO).
- **Skema minimal**: tabel `dramas` tunggal dengan `bookId` unik, slug unik, genres sebagai kolom JSON, flag featured + urutan; **tanpa** tabel seasons maupun episodes — jumlah episode cukup dari kolom `totalEpisodes`.
- **Sinkronisasi**: cron Dokploy → endpoint internal bersifat rahasia (bearer); job ringan upsert latest+featured+rank by `bookId`; seed awal lewat perintah full-fetch sekali.
- **URL video on-demand**: tidak disimpan; diambil dari api-proxy saat episode dibuka, cache TTL pendek, respons ditandai sumber data; player pakai hls.js bila URL berekstensi m3u8.
- **Kontrak respons** seragam `{ success, data, meta? }` / `{ error: { code, message } }`; skema Zod dibagikan lewat paket shared agar client type-safe.

## Testing Decisions

- **Seam utama (satu)**: batas HTTP aplikasi API — semua perilaku bisnis (katalog, filter, sync, on-demand episode) diuji dengan memanggil app Hono langsung (tanpa server hidup) terhadap SQLite sementara yang di-seed. Mengapa: seam tertinggi yang masih cepat; menutup route→service→db sekaligus tanpa mock berlapis.
- **Seam kedua**: api-proxy palsu — server stub kecil di test menggantikan `API_PROXY_URL`, supaya perilaku on-demand (termasuk URL mati/token refresh) bisa diuji deterministik tanpa internet.
- Yang diuji: transformasi & upsert sync (idempoten — jalankan dua kali, jumlah baris sama), query katalog (filter genre dari JSON, search, sort, paginasi), endpoint episode (memilih episode ke-N, prev/next benar di tepi: episode pertama tanpa prev), guard secret internal.
- Yang **tidak** diuji: komponen React satu-satu (MVP diverifikasi manual + type safety); E2E browser ditunda fase 2.
- Prior art: pola test route/service di repo lama (`bun:test`) diadaptasi ke arsitektur baru.

## Out of Scope

- Autentikasi apa pun (better-auth ditunda), watchlist, riwayat/lanjut menonton, admin panel.
- Katalog multi-bahasa (~4500 drama non-indo).
- SSR/SEO/sitemap/OpenGraph dinamis.
- Hosting video sendiri, transcoding, CDN; komentar, rating pengguna, notifikasi.
- E2E testing dan CI pipeline formal (menyusul).

## Further Notes

- Referensi implementasi lama: repo `mukhsin/dracin` (cache docs: `/tmp/opencode/old-repo-docs/`) — khususnya pola fallback/validasi URL video dan scraper api-proxy.
- Keputusan #2 awal (embed/iframe pihak ketiga) **direvisi** menjadi player sendiri dengan URL dari api-proxy — lihat STATE.md Q24.
- Risiko utama & mitigasi terdaftar di `docs/PLAN.md` §8.
