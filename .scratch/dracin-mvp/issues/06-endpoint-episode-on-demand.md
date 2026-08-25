# 06: Endpoint episode on-demand

**What to build:** Endpoint player yang mengambil URL tayang segar saat dibuka: terima slug + nomor episode, panggil api-proxy episodes/:bookId, pilih episode ke-N (prioritas cdnList pertama → fallback videoUrl), bungkus dengan navigasi prev/next, tandai meta.source, dan cache in-memory TTL pendek supaya buka ulang cepat.

**Blocked by:** 02, 05

**Status:** ready-for-agent

- [ ] GET episodes/:number mengembalikan URL video segar + info navigasi prev/next
- [ ] Tepi benar: episode pertama tanpa prev, terakhir tanpa next; nomor tak valid → 404 standar
- [ ] Cache TTL pendek bekerja (permintaan kedua dalam TTL tidak memanggil upstream lagi)
- [ ] Test memakai stub server palsu sebagai pengganti API_PROXY_URL (tanpa internet)
