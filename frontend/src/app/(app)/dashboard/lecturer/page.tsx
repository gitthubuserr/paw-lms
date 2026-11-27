'use client';

import { useAuth } from '@/components/AuthProvider';

export default function LecturerHome() {
  const { user } = useAuth();
  return (
    <>
      <header className="page-head">
        <h1>Selamat datang, {user?.name}</h1>
      </header>
      <div className="panel">
        <p>Kelas yang Anda ajar, tugas yang perlu dinilai, dan materi akan tampil di beranda ini seiring modul lain selesai.</p>
      </div>
    </>
  );
}
