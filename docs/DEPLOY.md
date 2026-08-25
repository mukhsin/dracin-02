# Deployment — VPS + Dokploy

## Prasyarat

- VPS dengan Docker & Dokploy terpasang, domain mengarah ke server.
- Repo ini ter-clone di server (atau build langsung dari GitHub via Dokploy).
- `SECRET_KEY` DramaBox asli (kunci privat penandatanganan — hanya kamu yang punya).

## 1. Siapkan environment

Di root repo:

```bash
# secret untuk endpoint sinkronisasi internal
echo "CRON_SECRET=$(openssl rand -hex 32)" > .env
```

Untuk scraper upstream:

```bash
cp apps/api-proxy/.env.example apps/api-proxy/.env
# edit apps/api-proxy/.env → isi SECRET_KEY asli (PEM utuh / path / base64)
```

> `.env` tidak pernah masuk git — jangan commit kunci.

## 2. Deploy via Dokploy

1. Buat project + service **Compose** baru, arahkan ke repo/branch `main`.
2. Dokploy membaca `docker-compose.yml`: dua layanan (`app`, `api-proxy`) dari satu image.
3. Set domain → port `3001` (atau ubah `APP_PORT`). Health check `/health` sudah tertanam di compose.

## 3. Seed awal (sekali saja)

Masuk container `app` (terminal Dokploy atau SSH):

```bash
docker compose exec app bun apps/api/src/scripts/sync-full.ts
```

Menarik seluruh katalog drama indo (~865) ke SQLite di volume `dracin-data`.

## 4. Cron sinkronisasi

Di Dokploy buat **cron job** tiap 6 jam:

```bash
curl -fsS -X POST http://app:3001/internal/sync \
  -H "Authorization: Bearer $CRON_SECRET"
```

(Jika cron Dokploy berjalan di luar jaringan compose, ganti host sesuai ekspos layanan.) Ambil nilai token dari file `.env` root. Respons sukses: `{"success":true,"data":{"latest":N,"featured":N,"rank":N}}`.

## 5. Update aplikasi

```bash
git pull && docker compose build && docker compose up -d
```

Atau tombol redeploy di Dokploy. Data aman di volume; migrasi berjalan otomatis saat boot.

## Catatan

- Image tunggal untuk dua layanan (beda command); ukuran bisa dipangkas belakangan.
- Verifikasi `docker compose build` dilakukan pertama kali di VPS (environment pengembangan lokal tidak punya Docker daemon).
- Jika upstream DramaBox gagal sign: cek `SECRET_KEY` di `apps/api-proxy/.env` dan log layanan `api-proxy`.
