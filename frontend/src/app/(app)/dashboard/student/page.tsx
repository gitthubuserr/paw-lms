'use client';

import { useAuth } from '@/components/AuthProvider';

export default function StudentHome() {
  const { user } = useAuth();
  return (
    <>
      <header className="page-head">
        <h1>Halo, {user?.name}</h1>
      </header>
      <div className="panel">
        <p>Kelas yang Anda ikuti, tugas dengan tenggat terdekat, dan nilai terbaru akan tampil di beranda ini seiring modul lain selesai.</p>
      </div>
    </>
  );
}
