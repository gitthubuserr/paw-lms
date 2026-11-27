import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
/** Batasi endpoint untuk role tertentu. Contoh: @Roles(Role.ADMIN, Role.LECTURER) */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
