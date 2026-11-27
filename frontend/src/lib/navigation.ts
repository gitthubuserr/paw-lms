import { Role, roleHome } from './types';

export interface NavItem {
  label: string;
  href: string | ((role: Role) => string);
  roles: Role[];
  /** true = aktif hanya jika URL sama persis (untuk Beranda) */
  exact?: boolean;
}

const ALL: Role[] = ['ADMIN', 'LECTURER', 'STUDENT'];

/**
 * Menu sidebar. Setiap anggota tim menambahkan menu modulnya di sini lewat PR, contoh:
 *   { label: 'Kelas', href: '/dashboard/classes', roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
 *   { label: 'Tugas', href: '/dashboard/assignments', roles: ['LECTURER', 'STUDENT'] },
 * Taruh sebelum 'Profil'.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Beranda', href: roleHome, roles: ALL, exact: true },
  { label: 'Pengguna', href: '/dashboard/admin/users', roles: ['ADMIN'] },
  { label: 'Profil', href: '/profile', roles: ALL },
];
