# 04: Sinkronisasi end-to-end (seed full + internal sync)

**What to build:** Alur pengisian katalog otomatis: perintah seed sekali yang menarik seluruh drama indo (~865) dari api-proxy, dan endpoint internal untuk cron Dokploy yang melakukan upsert ringkasan incremental (latest + featured + rank). Idempoten by bookId, terlindungi bearer secret, dengan log ringkas.

**Blocked by:** 02, 03

**Status:** ready-for-agent

- [ ] Perintah seed full mengisi database dari endpoint fetch-all api-proxy
- [ ] POST internal sync tanpa secret → 401; dengan bearer CRON_SECRET → upsert latest+featured+rank
- [ ] Idempoten: eksekusi dua kali tidak menduplikasi baris (terverifikasi test)
- [ ] Log ringkas hasil tiap sync (jumlah baris upsert/skip)
