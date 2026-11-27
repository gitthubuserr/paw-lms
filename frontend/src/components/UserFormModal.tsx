'use client';

import { FormEvent, useState } from 'react';
import { ROLE_LABEL, Role, User } from '@/lib/types';
import { errorMessage } from '@/services/api';
import { usersService } from '@/services/users';
import { Modal } from './Modal';

interface Props {
  open: boolean;
  user: User | null; // null = mode tambah
  currentUserId: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function UserFormModal({ open, user, currentUserId, onClose, onSaved }: Props) {
  return (
    <Modal open={open} title={user ? 'Ubah pengguna' : 'Tambah pengguna'} onClose={onClose}>
      {/* key: form dibuat ulang tiap dibuka sehingga state lama tidak terbawa */}
      <UserForm key={user?.id ?? 'new'} user={user} isSelf={user?.id === currentUserId} onClose={onClose} onSaved={onSaved} />
    </Modal>
  );
}

function UserForm({ user, isSelf, onClose, onSaved }: { user: User | null; isSelf: boolean; onClose: () => void; onSaved: (m: string) => void }) {
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? 'STUDENT');
  const [identityNumber, setIdentityNumber] = useState(user?.identityNumber ?? '');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(user?.isActive ?? true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (user) {
        await usersService.update(user.id, {
          name,
          email,
          role,
          identityNumber,
          isActive,
          ...(password ? { password } : {}),
        });
        onSaved('Perubahan pengguna disimpan');
      } else {
        await usersService.create({ name, email, role, identityNumber, password });
        onSaved('Pengguna baru ditambahkan');
      }
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="form">
      {error && (
        <div className="notice notice-danger" role="alert">
          {error}
        </div>
      )}
      <label className="field">
        <span>Nama lengkap</span>
        <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} autoFocus />
      </label>
      <label className="field">
        <span>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <div className="field-row">
        <label className="field">
          <span>Peran</span>
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} disabled={isSelf}>
            {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>NIM / NIP (opsional)</span>
          <input value={identityNumber} onChange={(e) => setIdentityNumber(e.target.value)} />
        </label>
      </div>
      <label className="field">
        <span>{user ? 'Kata sandi baru (kosongkan jika tidak diubah)' : 'Kata sandi'}</span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required={!user} autoComplete="new-password" />
        <small>Minimal 8 karakter dengan huruf dan angka.</small>
      </label>
      {user && (
        <label className="check">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={isSelf} />
          <span>Akun aktif</span>
        </label>
      )}
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
}
