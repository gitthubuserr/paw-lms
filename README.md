Untuk jalankan web lokal, isi file .env.local dengan file .env.local.example di folder frontend lalu jalankan 2 terminal:
Terminal 1:
    cd backend
    npm run start:dev

Terminal 2:
    cd frontend
    npm run dev

cara run databs:
### Prasyarat
- **Node.js** versi `20.19+` atau `22 LTS`
- **PostgreSQL 17** (disarankan lewat **Docker** menggunakan `docker-compose.yml`)

### 1. Clone Repo & Nyalakan Database
```bash
git clone [https://github.com/gitthubuserr/paw-lms.git](https://github.com/gitthubuserr/paw-lms.git)
cd paw-lms
docker compose up -d
```
> Lewati `docker compose up -d` jika menggunakan PostgreSQL lokal yang sudah aktif, lalu sesuaikan `DATABASE_URL` pada file `backend/.env`.

### 2. Jalankan Backend (NestJS + Prisma 6)
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```
Buka `http://localhost:3001/api/health` dan pastikan respons menampilkan `"status": "ok"`.

### 3. Jalankan Frontend (Next.js)
Buka terminal baru dari folder root repo:
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```
Pastikan `frontend/.env.local` memuat `NEXT_PUBLIC_API_URL=http://localhost:3001/api`, lalu buka `http://localhost:3000`.

### Catatan Pengembangan
- **Akses Database:** `PrismaModule` bersifat `@Global()`, sehingga modul fitur cukup langsung menginjeksi `PrismaService`.
- **GUI Database:** Jalankan `npx prisma studio` di folder `backend/` untuk membuka antarmuka database di `http://localhost:5555`.
- **Hentikan Database Docker:** Jalankan `docker compose down` dari folder root repo.
- **Aturan Kolaborasi:** Buat branch baru untuk tiap modul (`git checkout -b feat/nama-modul`), jangan commit `.env` / `.env.local`, dan koordinasikan terlebih dahulu sebelum mengubah `backend/prisma/schema.prisma` atau versi Prisma (`6.x`).
