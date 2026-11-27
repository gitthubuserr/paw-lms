import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * Guard GLOBAL kedua (berjalan setelah JwtAuthGuard).
 * Tanpa @Roles() -> semua user yang sudah login boleh.
 * Dengan @Roles(...) -> hanya role yang terdaftar.
 * Catatan: guard ini hanya memeriksa ROLE. Pemeriksaan KEPEMILIKAN
 * (mis. dosen hanya kelas yang ia ajar) dilakukan di service tiap modul.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('Anda tidak memiliki akses ke sumber daya ini');
    }
    return true;
  }
}
