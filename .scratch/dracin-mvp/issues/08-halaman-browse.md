# 08: Halaman browse (search + genre + sort)

**What to build:** Halaman jelajah katalog: kotak pencarian judul (debounced), chip genre dari API, pilihan sortir (terbaru/rating/judul), grid hasil dengan paginasi — seluruh state tersimpan di query param URL sehingga hasil bisa dibagikan.

**Blocked by:** 07

**Status:** ready-for-agent

- [ ] Search judul dengan debounce memicu query baru tanpa ngetik ulang
- [ ] Filter genre & sortir berfungsi dan tergabung dengan search
- [ ] State lengkap tersimpan di URL (?q=&genre=&sort=&page=); buka link langsung menampilkan hasil sama
- [ ] Empty state ramah bahasa Indonesia saat hasil kosong; paginasi/load-more bekerja
