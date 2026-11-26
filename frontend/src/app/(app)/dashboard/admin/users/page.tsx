'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Modal } from '@/components/Modal';
import { UserFormModal } from '@/components/UserFormModal';
import { PageMeta, ROLE_LABEL, Role, User } from '@/lib/types';
import { errorMessage } from '@/services/api';
import { usersService } from '@/services/users';

type StatusFilter = '' | 'active' | 'inactive';

export default function UsersPage() {
  const { user: me } = useAuth();
  const [items, setItems] = useState<User[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [flash, setFlash] = useState('');

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [status, setStatus] = useState<StatusFilter>('');

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  // Debounce pencarian: tunggu 350 ms setelah berhenti mengetik agar tidak menembak API per huruf.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersService.list({
        page,
        limit: 10,
        search,
        role,
        isActive: status === '' ? undefined : status === 'active',
      });
      setItems(res.items);
      setMeta(res.meta);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, search, role, status]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(''), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  async function toggleActive(u: User) {
    setBusy(true);
    try {
      await usersService.update(u.id, { isActive: !u.isActive });
      setFlash(u.isActive ? `${u.name} dinonaktifkan` : `${u.name} diaktifkan`);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await usersService.remove(deleting.id);
      setFlash(`${deleting.name} dihapus`);
      setDeleting(null);
      // Jika yang dihapus item terakhir di halaman ini, mundur satu halaman.
      if (items.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (e) {
      setError(errorMessage(e));
      setDeleting(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="page-head">
        <h1>Kelola pengguna</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Tambah pengguna
        </button>
      </header>

      {flash && <div className="notice notice-ok" role="status">{flash}</div>}
      {error && <div className="notice notice-danger" role="alert">{error}</div>}

      <div className="toolbar">
        <input type="search" placeholder="Cari nama, email, atau NIM/NIP" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} aria-label="Cari pengguna" />
        <select value={role} onChange={(e) => { setRole(e.target.value as Role | ''); setPage(1); }} aria-label="Filter peran">
          <option value="">Semua peran</option>
          {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
            <option key={r} value={r}>{ROLE_LABEL[r]}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value as StatusFilter); setPage(1); }} aria-label="Filter status">
          <option value="">Semua status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>NIM / NIP</th>
              <th>Peran</th>
              <th>Status</th>
              <th className="right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="empty">Memuat data...</td></tr>
            )}
            {!loading && items.length === 0 && (
              <tr><td colSpan={5} className="empty">Tidak ada pengguna yang cocok. Ubah kata kunci atau filter.</td></tr>
            )}
            {!loading &&
              items.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="cell-main">{u.name}</div>
                    <div className="cell-sub">{u.email}</div>
                  </td>
                  <td>{u.identityNumber ?? '-'}</td>
                  <td><span className={`badge badge-${u.role.toLowerCase()}`}>{ROLE_LABEL[u.role]}</span></td>
                  <td><span className={u.isActive ? 'dot dot-on' : 'dot dot-off'}>{u.isActive ? 'Aktif' : 'Nonaktif'}</span></td>
                  <td className="right actions">
                    <button className="link-btn" onClick={() => { setEditing(u); setFormOpen(true); }}>Ubah</button>
                    {u.id !== me?.id && (
                      <>
                        <button className="link-btn" disabled={busy} onClick={() => toggleActive(u)}>{u.isActive ? 'Nonaktifkan' : 'Aktifkan'}</button>
                        <button className="link-btn danger" onClick={() => setDeleting(u)}>Hapus</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {meta && meta.total > 0 && (
        <div className="pager">
          <span className="muted small">
            {meta.total} pengguna, halaman {meta.page} dari {meta.totalPages}
          </span>
          <div>
            <button className="btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</button>
            <button className="btn" disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>Berikutnya</button>
          </div>
        </div>
      )}

      <UserFormModal
        open={formOpen}
        user={editing}
        currentUserId={me?.id ?? ''}
        onClose={() => setFormOpen(false)}
        onSaved={(message) => {
          setFlash(message);
          load();
        }}
      />

      <Modal open={deleting !== null} title="Hapus pengguna?" onClose={() => setDeleting(null)}>
        <p>
          Akun <strong>{deleting?.name}</strong> akan dihapus permanen. Jika pengguna sudah punya kelas atau tugas, penghapusan ditolak dan Anda
          dapat menonaktifkan akunnya.
        </p>
        <div className="modal-actions">
          <button className="btn" onClick={() => setDeleting(null)}>Batal</button>
          <button className="btn btn-danger" disabled={busy} onClick={confirmDelete}>Hapus</button>
        </div>
      </Modal>
    </>
  );
}
