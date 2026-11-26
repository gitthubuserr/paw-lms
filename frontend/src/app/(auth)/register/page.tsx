'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useRedirectIfAuthenticated } from '@/components/AuthProvider';
import { errorMessage } from '@/services/api';
import { authService } from '@/services/auth';

export default function RegisterPage() {
  useRedirectIfAuthenticated();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', identityNumber: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Konfirmasi kata sandi tidak sama');
      return;
    }
    setSubmitting(true);
    try {
      await authService.register({
        name: form.name,
        email: form.email,
        identityNumber: form.identityNumber || undefined,
        password: form.password,
      });
      router.replace('/login?registered=1');
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Buat akun mahasiswa</h2>
      <p className="muted">Akun dosen dibuat oleh administrator.</p>

      {error && (
        <div className="notice notice-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="form">
        <label className="field">
          <span>Nama lengkap</span>
          <input value={form.name} onChange={set('name')} required minLength={2} maxLength={100} autoComplete="name" autoFocus />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" value={form.email} onChange={set('email')} required autoComplete="email" />
        </label>
        <label className="field">
          <span>NIM (opsional)</span>
          <input value={form.identityNumber} onChange={set('identityNumber')} />
        </label>
        <label className="field">
          <span>Kata sandi</span>
          <input type="password" value={form.password} onChange={set('password')} required autoComplete="new-password" />
          <small>Minimal 8 karakter dengan huruf dan angka.</small>
        </label>
        <label className="field">
          <span>Ulangi kata sandi</span>
          <input type="password" value={form.confirm} onChange={set('confirm')} required autoComplete="new-password" />
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Membuat akun...' : 'Buat akun'}
        </button>
      </form>

      <p className="muted small">
        Sudah punya akun? <Link href="/login">Masuk</Link>
      </p>
    </div>
  );
}
