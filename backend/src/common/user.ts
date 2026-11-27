import { Prisma, User } from '@prisma/client';

/**
 * Daftar kolom yang BOLEH keluar lewat API. `password` sengaja tidak ada.
 * Memakai whitelist (select) lebih aman daripada "hapus password" karena
 * kolom sensitif baru yang ditambahkan nanti tidak otomatis ikut bocor.
 */
export const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  identityNumber: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type SafeUser = Prisma.UserGetPayload<{ select: typeof USER_SELECT }>;

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    identityNumber: user.identityNumber,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
