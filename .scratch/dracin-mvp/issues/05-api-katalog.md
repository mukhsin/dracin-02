# 05: API katalog (list/featured/genres/detail)

**What to build:** Seluruh read API katalog: list dengan paginasi/search judul/filter genre/sortir, featured urut featuredOrder, daftar genre beserta jumlah drama (dihitung dari kolom JSON), dan detail by slug. Diuji lewat seam Hono terhadap SQLite seed sementara.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] GET list mendukung page/limit/search/genre/sort (newest|rating|title), respons paginasi standar
- [ ] GET featured mengembalikan drama featured urut featuredOrder dengan limit default wajar
- [ ] GET genres mengembalikan genre unik + jumlah dramanya
- [ ] GET detail by slug → data lengkap; slug tak dikenal → 404 format error standar
- [ ] Test seam Hono mencakup search, filter genre JSON, sort, paginasi, dan kasus 404
