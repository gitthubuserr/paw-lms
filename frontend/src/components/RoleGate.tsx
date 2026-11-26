'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Role, roleHome } from '@/lib/types';
import { useAuth } from './AuthProvider';

/**
 * Pembatas tampilan per role. INI HANYA UX: data tetap dilindungi RolesGuard di backend.
 * Pakai di layout.tsx tiap segmen, contoh:
 *   <RoleGate roles={['LECTURER']}>{children}</RoleGate>
 */
export function RoleGate({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user) return null; // AppShell sudah menangani kasus belum login
  if (!roles.includes(user.role)) {
    return (
      <div className="notice notice-danger" role="alert">
        <strong>Akses ditolak.</strong> Halaman ini tidak tersedia untuk peran Anda.{' '}
        <Link href={roleHome(user.role)}>Kembali ke beranda</Link>
      </div>
    );
  }
  return <>{children}</>;
}
