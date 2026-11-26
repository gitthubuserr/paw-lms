/**
 * Validasi environment saat aplikasi start (fail fast).
 * Lebih baik aplikasi gagal start dengan pesan jelas daripada jalan dengan
 * JWT_SECRET kosong/lemah yang membuat token mudah dipalsukan.
 */
export function validateEnv(config: Record<string, unknown>) {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Environment variable belum diisi: ${missing.join(', ')}`);
  }
  if (String(config.JWT_SECRET).length < 32) {
    throw new Error('JWT_SECRET minimal 32 karakter');
  }
  return config;
}
