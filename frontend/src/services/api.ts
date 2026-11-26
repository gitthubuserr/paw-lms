import { ApiResponse } from '@/lib/types';

export class ApiError extends Error {
  constructor(message: string, public status: number, public errors?: string[]) {
    super(message);
  }
}

type Query = Record<string, string | number | boolean | undefined>;

interface Options {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Query;
}

/**
 * Satu pintu semua request ke backend.
 * - credentials: 'include' -> cookie sesi ikut terkirim
 * - semua error dinormalisasi menjadi ApiError (message sudah berbahasa Indonesia dari backend)
 * Modul lain cukup memakai fungsi ini: request<T>('/classes', { method: 'POST', body })
 */
export async function request<T>(path: string, { method = 'GET', body, query }: Options = {}): Promise<ApiResponse<T>> {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  const qs = params.size > 0 ? `?${params}` : '';

  let res: Response;
  try {
    res = await fetch(`/api${path}${qs}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi Anda.', 0);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(json?.message ?? 'Terjadi kesalahan pada server', res.status, json?.errors);
  }
  return json as ApiResponse<T>;
}

/** Ubah error apa pun menjadi teks untuk ditampilkan ke pengguna. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.errors?.length ? error.errors.join('. ') : error.message;
  }
  return 'Terjadi kesalahan tak terduga';
}
