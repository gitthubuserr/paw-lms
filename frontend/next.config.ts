import type { NextConfig } from 'next';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:4000';

const config: NextConfig = {
  output: 'standalone', // dipakai Dockerfile (Orang 6) agar image kecil
  /**
   * Browser selalu memanggil /api/... di domain yang sama dengan frontend,
   * lalu Next meneruskannya ke backend. Manfaatnya:
   *  - tidak ada masalah CORS
   *  - cookie sesi httpOnly berlaku untuk satu origin (aman & sederhana)
   * Di production (VPS), Nginx bisa mengambil alih rute /api langsung ke backend.
   */
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default config;
