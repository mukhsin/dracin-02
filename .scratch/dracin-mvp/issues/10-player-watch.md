# 10: Player watch + navigasi episode

**What to build:** Halaman pemutar end-to-end: ambil data episode on-demand dari API, putar video (hls.js bila URL m3u8, native bila mp4), tampilkan identitas episode, tombol prev/next antar episode (nonaktif di tepi), dan tautan balik ke halaman detail. Menuntaskan alur inti pengguna: jelajah → detail → tonton → lanjut episode.

**Blocked by:** 06, 09

**Status:** ready-for-agent

- [ ] Episode terputar dari URL segar; HLS via hls.js, mp4 native
- [ ] Judul/nomor episode dan nama drama tampil di sekitar player
- [ ] Prev/next berpindah episode; nonaktif di episode pertama/terakhir
- [ ] State error ramah jika URL gagal dimuat; link balik ke detail berfungsi
