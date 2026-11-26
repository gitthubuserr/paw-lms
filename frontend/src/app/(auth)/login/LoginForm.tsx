'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useAuth, useRedirectIfAuthenticated } from '@/components/AuthProvider';
import { roleHome } from '@/lib/types';
import { errorMessage } from '@/services/api';

/** Hanya terima path internal (cegah open redirect seperti ?next=https://situs-jahat.com). */
function safeNext(next: string | null): string | null {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : null;
}

export function LoginForm() {
  useRedirectIfAuthenticated();
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(email, password);
      router.replace(safeNext(params.get('next')) ?? roleHome(user.role));
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Masuk</h2>
      <p className="muted">Gunakan email yang terdaftar di sistem.</p>

      {params.get('registered') && (
        <div className="notice notice-ok" role="status">
          Akun berhasil dibuat. Silakan masuk.
        </div>
      )}
      {error && (
        <div className="notice notice-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="form">
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus />
        </label>
        <label className="field">
          <span>Kata sandi</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Memeriksa...' : 'Masuk'}
        </button>
      </form>

      <p className="muted small">
        Belum punya akun? <Link href="/register">Daftar sebagai mahasiswa</Link>
      </p>
    </div>
  );
}
