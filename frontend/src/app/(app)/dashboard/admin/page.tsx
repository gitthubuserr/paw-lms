'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { errorMessage } from '@/services/api';
import { usersService } from '@/services/users';

interface Counts {
  students: number;
  lecturers: number;
  admins: number;
  inactive: number;
}

export default function AdminHome() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      usersService.list({ role: 'STUDENT', limit: 1 }),
      usersService.list({ role: 'LECTURER', limit: 1 }),
      usersService.list({ role: 'ADMIN', limit: 1 }),
      usersService.list({ isActive: false, limit: 1 }),
    ])
      .then(([s, l, a, i]) => setCounts({ students: s.meta.total, lecturers: l.meta.total, admins: a.meta.total, inactive: i.meta.total }))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const stats = counts
    ? [
        { label: 'Mahasiswa', value: counts.students },
        { label: 'Dosen', value: counts.lecturers },
        { label: 'Administrator', value: counts.admins },
        { label: 'Akun nonaktif', value: counts.inactive },
      ]
    : [];

  return (
    <>
      <header className="page-head">
        <h1>Beranda administrator</h1>
        <Link href="/dashboard/admin/users" className="btn btn-primary">
          Kelola pengguna
        </Link>
      </header>
      {error && <div className="notice notice-danger" role="alert">{error}</div>}
      {!counts && !error && <p className="muted">Memuat ringkasan...</p>}
      <dl className="stats">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <dd>{s.value}</dd>
            <dt>{s.label}</dt>
          </div>
        ))}
      </dl>
    </>
  );
}
