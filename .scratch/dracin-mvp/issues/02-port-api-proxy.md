# 02: Port api-proxy jadi layanan mandiri

**What to build:** Scraper DramaBox dari repo lama diport utuh sebagai aplikasi ketiga monorepo — layanan HTTP terpisah yang menyediakan katalog (latest, featured, rank, all/fetch-all indo, search) dan daftar episode per drama termasuk URL videonya. Termasuk logika token/refresh agar permintaan ke upstream selalu sah.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Layanan jalan di port sendiri via script dev workspace; `/health` merespons
- [ ] Endpoint katalog & episode berfungsi sesuai format README repo lama (status/data)
- [ ] Logika refresh token dari kode lama dibawa utuh; SECRET_KEY dibaca dari env (.env.example disediakan)
- [ ] `curl /drama/latest` dan `curl /drama/episodes/:bookId` mengembalikan data nyata dari upstream
