# 03: Skema DB + migrasi Drizzle

**What to build:** Database mirror SQLite via Drizzle ORM di aplikasi API: satu tabel `dramas` (bookId unik ID upstream, slug unik, title, description, posterUrl, genres JSON, status, totalEpisodes, playCount, featured + featuredOrder, timestamps) dengan index untuk akses katalog. Tanpa tabel seasons/episodes.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Definisi skema Drizzle lengkap sesuai spec; genres sebagai kolom JSON
- [ ] Index: slug, bookId, status, featured
- [ ] Perintah migrasi membuat file SQLite di path dari env DB_PATH dan tabel siap dipakai
- [ ] Koneksi DB diekspos lewat modul tunggal yang dipakai route/service lain
