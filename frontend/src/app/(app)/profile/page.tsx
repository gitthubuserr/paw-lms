'use client';

import { FormEvent, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { ROLE_LABEL } from '@/lib/types';
import { errorMessage } from '@/services/api';
import { usersService } from '@/services/users';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    try {
      setUser(await usersService.updateProfile(name));
      setProfileMsg({ ok: true, text: 'Profil diperbarui' });
    } catch (err) {
      setProfileMsg({ ok: false, text: errorMessage(err) });
    }
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pw.next !== pw.confirm) {
      setPwMsg({ ok: false, text: 'Konfirmasi kata sandi baru tidak sama' });
      return;
    }
    setSaving(true);
    try {
      await usersService.changePassword(pw.current, pw.next);
      setPw({ current: '', next: '', confirm: '' });
      setPwMsg({ ok: true, text: 'Kata sandi berhasil diubah' });
    } catch (err) {
      setPwMsg({ ok: false, text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="page-head"><h1>Profil</h1></header>

      <div className="two-col">
        <section className="panel">
          <h2>Data akun</h2>
          <dl className="facts">
            <div><dt>Email</dt><dd>{user.email}</dd></div>
            <div><dt>Peran</dt><dd>{ROLE_LABEL[user.role]}</dd></div>
            <div><dt>NIM / NIP</dt><dd>{user.identityNumber ?? '-'}</dd></div>
          </dl>
          <p className="muted small">Email, peran, dan NIM/NIP diubah oleh administrator.</p>

          <form onSubmit={saveProfile} className="form">
            {profileMsg && <div className={profileMsg.ok ? 'notice notice-ok' : 'notice notice-danger'} role="status">{profileMsg.text}</div>}
            <label className="field">
              <span>Nama lengkap</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} />
            </label>
            <button className="btn btn-primary" type="submit">Simpan nama</button>
          </form>
        </section>

        <section className="panel">
          <h2>Ubah kata sandi</h2>
          <form onSubmit={savePassword} className="form">
            {pwMsg && <div className={pwMsg.ok ? 'notice notice-ok' : 'notice notice-danger'} role="status">{pwMsg.text}</div>}
            <label className="field">
              <span>Kata sandi saat ini</span>
              <input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} required autoComplete="current-password" />
            </label>
            <label className="field">
              <span>Kata sandi baru</span>
              <input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} required autoComplete="new-password" />
              <small>Minimal 8 karakter dengan huruf dan angka.</small>
            </label>
            <label className="field">
              <span>Ulangi kata sandi baru</span>
              <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required autoComplete="new-password" />
            </label>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Ubah kata sandi'}</button>
          </form>
        </section>
      </div>
    </>
  );
}
