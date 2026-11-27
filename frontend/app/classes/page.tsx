'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Lecturer {
  id: number;
  name: string;
  email: string;
}

interface ClassItem {
  id: number;
  name: string;
  description: string | null;
  lecturerId: number;
  lecturer: Lecturer;
  _count?: {
    enrollments: number;
    assignments: number;
    materials: number;
  };
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State Form Tambah / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lecturerId, setLecturerId] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resClasses, resLecturers] = await Promise.all([
        fetch(`${API_URL}/classes`),
        fetch(`${API_URL}/classes/lecturers`),
      ]);
      if (!resClasses.ok) throw new Error('Gagal memuat daftar kelas');
      setClasses(await resClasses.json());
      if (resLecturers.ok) {
        setLecturers(await resLecturers.json());
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setLecturerId(lecturers[0]?.id || '');
    setIsFormOpen(true);
  };

  const openEditForm = (item: ClassItem) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description || '');
    setLecturerId(item.lecturerId);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !lecturerId) return;

    setSubmitting(true);
    setError('');
    try {
      const url = editingId
        ? `${API_URL}/classes/${editingId}`
        : `${API_URL}/classes`;
      const method = editingId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          lecturerId: Number(lecturerId),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal menyimpan data kelas');
      }

      setIsFormOpen(false);
      await fetchData();
    } catch (err: any) {
      setError(Array.isArray(err.message) ? err.message.join(', ') : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item: ClassItem) => {
    const confirmed = window.confirm(
      `Yakin ingin menghapus kelas "${item.name}"?\n\nPERINGATAN: Seluruh peserta, materi, tugas, dan nilai di dalam kelas ini akan ikut terhapus permanen.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_URL}/classes/${item.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Gagal menghapus kelas');
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manajemen Kelas</h1>
          <p className="text-sm text-gray-400">
            Kelola daftar mata kuliah dan dosen pengampu
          </p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Tambah Kelas
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Form Tambah / Edit Kelas */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-5 border border-gray-200 rounded-xl bg-white text-gray-900 shadow-sm space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Edit Informasi Kelas' : 'Buat Kelas Baru'}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kelas *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Pemrograman Aplikasi Web"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi singkat mata kuliah (opsional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosen Pengampu *
            </label>
            <select
              required
              value={lecturerId}
              onChange={(e) => setLecturerId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              <option value="">-- Pilih Dosen --</option>
              {lecturers.map((dosen) => (
                <option key={dosen.id} value={dosen.id}>
                  {dosen.name} ({dosen.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Kelas'}
            </button>
          </div>
        </form>
      )}

      {/* Daftar Kelas */}
      {loading ? (
        <p className="text-gray-400">Memuat data kelas...</p>
      ) : classes.length === 0 ? (
        <div className="p-8 text-center border border-gray-700 rounded-xl text-gray-300">
          Belum ada kelas. Klik tombol <strong>+ Tambah Kelas</strong> untuk memulai.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {classes.map((item) => (
            <div
              key={item.id}
              className="p-5 border border-gray-200 rounded-xl bg-white text-gray-900 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/classes/${item.id}`}
                    className="text-lg font-semibold text-blue-600 hover:underline"
                  >
                    {item.name}
                  </Link>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description || 'Tidak ada deskripsi.'}
                </p>
                <p className="text-xs text-gray-500">
                  Dosen:{' '}
                  <span className="font-medium text-gray-800">
                    {item.lecturer?.name}
                  </span>
                </p>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
                <div className="flex gap-3">
                  <span>{item._count?.enrollments ?? 0} Mahasiswa</span>
                  <span>{item._count?.materials ?? 0} Materi</span>
                  <span>{item._count?.assignments ?? 0} Tugas</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditForm(item)}
                    className="px-2.5 py-1 border border-gray-300 rounded hover:bg-gray-100 text-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="px-2.5 py-1 border border-red-200 rounded hover:bg-red-50 text-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}