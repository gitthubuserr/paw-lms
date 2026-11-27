'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ClassDetail {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  lecturer: {
    id: number;
    name: string;
    email: string;
  };
  enrollments: {
    id: number;
    student: { id: number; name: string; email: string };
  }[];
  materials: { id: number; title: string; fileUrl: string }[];
  assignments: { id: number; title: string; deadline: string }[];
}

export default function ClassDetailPage() {
  const params = useParams();
  const id = params.id;
  const [data, setData] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`${API_URL}/classes/${id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Kelas tidak ditemukan');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-6 text-gray-300">Memuat detail kelas...</div>;
  if (error || !data) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-red-400">{error || 'Data tidak tersedia'}</p>
        <Link href="/classes" className="text-blue-400 hover:underline">
          ← Kembali ke Daftar Kelas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link href="/classes" className="text-sm text-blue-400 hover:underline">
        ← Kembali ke Daftar Kelas
      </Link>

      <div className="p-6 border border-gray-200 rounded-xl space-y-3 bg-white text-gray-900">
        <h1 className="text-2xl font-bold text-gray-900">{data.name}</h1>
        <p className="text-gray-600">
          {data.description || 'Tidak ada deskripsi kelas.'}
        </p>
        <div className="pt-2 text-sm text-gray-500">
          Dosen Pengampu:{' '}
          <span className="font-semibold text-gray-800">
            {data.lecturer.name}
          </span>{' '}
          ({data.lecturer.email})
        </div>
      </div>

      {/* Ringkasan Slot Integrasi Modul Anggota Lain */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-4 border border-gray-200 rounded-xl bg-white text-gray-900">
          <h2 className="font-semibold mb-2">
            Peserta ({data.enrollments.length})
          </h2>
          {data.enrollments.length === 0 ? (
            <p className="text-xs text-gray-500">Belum ada mahasiswa terdaftar.</p>
          ) : (
            <ul className="text-sm space-y-1 text-gray-700">
              {data.enrollments.map((e) => (
                <li key={e.id}>{e.student.name}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border border-gray-200 rounded-xl bg-white text-gray-900">
          <h2 className="font-semibold mb-2">
            Materi ({data.materials.length})
          </h2>
          {data.materials.length === 0 ? (
            <p className="text-xs text-gray-500">Belum ada materi diunggah.</p>
          ) : (
            <ul className="text-sm space-y-1 text-gray-700">
              {data.materials.map((m) => (
                <li key={m.id}>{m.title}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border border-gray-200 rounded-xl bg-white text-gray-900">
          <h2 className="font-semibold mb-2">
            Tugas ({data.assignments.length})
          </h2>
          {data.assignments.length === 0 ? (
            <p className="text-xs text-gray-500">Belum ada tugas dibuat.</p>
          ) : (
            <ul className="text-sm space-y-1 text-gray-700">
              {data.assignments.map((a) => (
                <li key={a.id}>{a.title}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}