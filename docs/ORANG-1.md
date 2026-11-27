# Dokumentasi Orang 1: Authentication & User Management

Dokumen ini menjelaskan apa yang dikerjakan, **mengapa** dibuat begitu, dan bagaimana anggota lain memakainya.
Cocok sebagai bahan penjelasan ke dosen/penguji.

## 1. Cakupan

| Kewajiban (pembagian tugas) | Implementasi |
| --- | --- |
| Register & login | `POST /api/auth/register`, `POST /api/auth/login` |
| Logout & session/JWT | `POST /api/auth/logout`, cookie httpOnly berisi JWT, `GET /api/auth/me` |
| Role-based access control | `RolesGuard` + dekorator `@Roles()`, enum `ADMIN / LECTURER / STUDENT` |
| CRUD pengguna | `/api/users` (khusus admin): daftar + cari + filter + paginasi, tambah, ubah, nonaktifkan, hapus |
| Profil pengguna | `PATCH /api/users/me/profile`, `PATCH /api/users/me/password`, halaman `/profile` |
| Guard/middleware akses | `JwtAuthGuard` global, `RolesGuard` global, `middleware.ts` di Next.js |
| Dashboard per role | `/dashboard/admin`, `/dashboard/lecturer`, `/dashboard/student` |

## 2. Keputusan teknis dan alasannya

**Token JWT disimpan di cookie `httpOnly`, bukan localStorage.** JavaScript di browser tidak bisa membaca cookie
httpOnly, sehingga kalau suatu hari ada celah XSS, token tidak ikut dicuri. Cookie juga memakai `SameSite=Lax`
(mitigasi CSRF) dan `Secure` saat HTTPS.

**Frontend memanggil `/api/...` di domain yang sama (rewrite Next.js).** Browser hanya berbicara dengan satu origin,
jadi tidak ada urusan CORS dan cookie berlaku mulus. Di VPS, Nginx tinggal meneruskan `/api` ke backend.

**Guard global, "aman secara default".** `JwtAuthGuard` dipasang untuk seluruh aplikasi; endpoint terbuka harus
ditandai `@Public()` secara eksplisit. Kalau anggota tim lupa memasang proteksi, hasilnya endpoint tertutup, bukan
terbuka. Urutan guard: rate limit, autentikasi, lalu otorisasi role.

**User dibaca ulang dari database di setiap request.** Token hanya membawa `id`. Role dan status aktif diambil dari
database, jadi saat admin menonaktifkan akun atau mengubah role, efeknya langsung berlaku. Biayanya satu query
ber-index per request, wajar untuk skala proyek ini.

**Registrasi publik selalu menjadi mahasiswa.** DTO register tidak punya field `role`, dan `ValidationPipe` memakai
`forbidNonWhitelisted`, jadi request yang menyisipkan `"role":"ADMIN"` ditolak. Dosen dan admin hanya dibuat oleh
admin. Ini mencegah privilege escalation.

**Password di-hash dengan bcrypt (cost 12) dan tidak pernah keluar dari API.** Respons memakai whitelist kolom
(`USER_SELECT`), bukan "hapus password dari objek", sehingga kolom sensitif baru tidak otomatis bocor.

**Pesan login seragam dan waktu respons disamakan.** "Email atau kata sandi salah" dipakai untuk kedua kasus, dan
ada hash palsu agar waktu respons tidak membocorkan apakah email terdaftar.

**Rate limiting.** Login dibatasi 10 percobaan/menit/IP dan register 5/menit untuk memperlambat tebak-sandi massal.

**Validasi di dua lapis.** Backend (class-validator) adalah penentu; form frontend hanya memberi umpan balik cepat.
Aturan sandi: 8-72 karakter, ada huruf dan angka (72 = batas byte bcrypt).

**Hapus pengguna dilindungi.** Admin tidak bisa menghapus, menonaktifkan, atau mengubah role akunnya sendiri
(mencegah terkunci). Menghapus pengguna yang sudah punya kelas/tugas ditolak dengan pesan jelas (foreign key),
dan solusinya adalah menonaktifkan akun.

**Format respons seragam.** Sukses: `{ success, data, meta? }`. Gagal: `{ success:false, statusCode, message, errors? }`.
Frontend cukup satu cara membaca hasil dari semua modul.

**ID memakai UUID.** ID tidak berurutan sehingga tidak bisa ditebak lewat enumerasi (`/users/1`, `/users/2`, ...).

## 3. Perubahan dari rancangan awal tabel `users`

Kolom dasar (`id, name, email, password, role`) dipertahankan. Ditambah: `identity_number` (NIM/NIP, opsional, unik),
`is_active` (nonaktifkan akun tanpa menghapus riwayat), `created_at`, `updated_at`.

## 4. Kontrak integrasi untuk Orang 2-6

**Mendaftarkan modul.** Tambahkan module Anda di `imports` pada `backend/src/app.module.ts`.
`PrismaService` sudah global, tidak perlu di-import ulang.

**Memproteksi endpoint.**

```ts
import { CurrentUser, Roles, SafeUser } from '../common';
import { Role } from '@prisma/client';

@Controller('classes')
export class ClassesController {
  @Post()
  @Roles(Role.ADMIN)                 // hanya admin
  create(@Body() dto: CreateClassDto) { ... }

  @Get('mine')                       // tanpa @Roles: semua yang sudah login
  mine(@CurrentUser() user: SafeUser) { ... }
}
```

**Kepemilikan data (dosen hanya kelasnya, mahasiswa hanya kelas yang diikuti)** tidak bisa diputuskan oleh role saja.
Periksa di service tiap modul memakai `user.id`, lalu lempar `ForbiddenException` bila bukan miliknya.

**Dropdown dosen/mahasiswa.** `GET /api/users/lookup?role=LECTURER|STUDENT&search=...` (admin dan dosen) mengembalikan
`id, name, email, identityNumber, role` akun aktif. Orang 2 memakainya untuk memilih dosen pengajar, Orang 3 untuk
memilih mahasiswa yang didaftarkan.

**Menu frontend.** Tambahkan menu modul di `frontend/src/lib/navigation.ts`. Untuk memanggil API gunakan
`request()` dari `frontend/src/services/api.ts`. Untuk membatasi halaman per role gunakan `<RoleGate>` di `layout.tsx` segmen Anda.

**Schema database.** Satu schema bersama di `backend/prisma/schema.prisma`. Perubahan lewat Pull Request, lalu
`npx prisma migrate dev --name <deskripsi>`. Jangan mengedit migrasi yang sudah di-merge.

**Timestamp pengumpulan (Orang 5).** `Submission.submittedAt` sudah `@default(now())` di database. Jangan menerima
waktu dari klien.

**Healthcheck (Orang 6).** `GET /api/health` (publik) memeriksa koneksi database. Set `TRUST_PROXY=true`,
`COOKIE_SECURE=true`, dan `NODE_ENV=production` di production. `TRUST_PROXY` penting supaya rate limit membaca IP
pengunjung asli di belakang Nginx, bukan IP Nginx.

## 5. Contoh uji dengan curl

```bash
curl -i -c cookies.txt -H "Content-Type: application/json" \
  -d '{"email":"admin@lms.test","password":"Admin12345"}' http://localhost:4000/api/auth/login
curl -b cookies.txt http://localhost:4000/api/auth/me
curl -b cookies.txt "http://localhost:4000/api/users?role=STUDENT&limit=5"
```

## 6. Daftar uji untuk demo

1. Daftar mahasiswa baru lalu login. Pastikan masuk ke `/dashboard/student`.
2. Login admin, buat akun dosen, login sebagai dosen. Pastikan masuk ke `/dashboard/lecturer`.
3. Mahasiswa membuka `/dashboard/admin/users`. Harus muncul "Akses ditolak", dan `GET /api/users` harus 403.
4. Tanpa login buka `/dashboard`. Harus diarahkan ke `/login`.
5. Admin menonaktifkan mahasiswa. Mahasiswa tidak bisa login dan sesinya yang berjalan ditolak (401) pada request berikutnya.
6. Kirim register dengan `"role":"ADMIN"` (Postman). Harus ditolak 400.
7. Salah password 11 kali dalam semenit. Harus 429.
8. Ubah nama dan kata sandi di halaman Profil.

## 7. Batasan yang diketahui

- Token tunggal tanpa refresh token. Masa berlaku 1 hari (`JWT_EXPIRES_IN_SECONDS`). Logout menghapus cookie di
  browser, tetapi token yang sudah dicuri tetap sah sampai kedaluwarsa (akun nonaktif tetap langsung ditolak).
  Pengembangan lanjutan: refresh token berumur pendek dengan rotasi dan penyimpanan hash di database.
- NIM/NIP tidak bisa dikosongkan kembali lewat form ubah pengguna (nilai kosong dianggap "tidak diubah").
- Belum ada fitur lupa kata sandi lewat email (butuh layanan SMTP).
