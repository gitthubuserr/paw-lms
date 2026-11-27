export type Role = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  identityNumber: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PageMeta;
}

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrator',
  LECTURER: 'Dosen',
  STUDENT: 'Mahasiswa',
};

export function roleHome(role: Role): string {
  return { ADMIN: '/dashboard/admin', LECTURER: '/dashboard/lecturer', STUDENT: '/dashboard/student' }[role];
}
