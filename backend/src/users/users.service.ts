import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../common/constants';
import { SafeUser, USER_SELECT } from '../common/user';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { LookupUsersDto } from './dto/lookup-users.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListUsersDto) {
    const { page, limit, search, role, isActive } = query;
    const where: Prisma.UserWhereInput = {
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { identityNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: USER_SELECT,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id }, select: USER_SELECT });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');
    return user;
  }

  /**
   * Daftar ringkas (id, nama, email) untuk dropdown di modul lain:
   * Orang 2 memilih dosen pengajar, Orang 3 memilih mahasiswa untuk didaftarkan.
   * Hanya akun aktif; dibatasi 50 hasil, gunakan `search` untuk menyaring.
   */
  lookup({ role, search }: LookupUsersDto) {
    return this.prisma.user.findMany({
      where: {
        isActive: true,
        role: role && role !== Role.ADMIN ? role : { in: [Role.LECTURER, Role.STUDENT] },
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { identityNumber: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      select: { id: true, name: true, email: true, identityNumber: true, role: true },
      orderBy: { name: 'asc' },
      take: 50,
    });
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    try {
      return await this.prisma.user.create({ data: { ...dto, password }, select: USER_SELECT });
    } catch (error) {
      this.rethrowUnique(error);
      throw error;
    }
  }

  async update(id: string, dto: UpdateUserDto, actor: SafeUser): Promise<SafeUser> {
    await this.findOne(id);

    // Cegah admin mengunci dirinya sendiri / menghilangkan satu-satunya admin.
    if (id === actor.id) {
      if (dto.role && dto.role !== actor.role) {
        throw new BadRequestException('Anda tidak dapat mengubah role akun Anda sendiri');
      }
      if (dto.isActive === false) {
        throw new BadRequestException('Anda tidak dapat menonaktifkan akun Anda sendiri');
      }
    }

    const { password, ...rest } = dto;
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...rest,
          ...(password && { password: await bcrypt.hash(password, BCRYPT_ROUNDS) }),
        },
        select: USER_SELECT,
      });
    } catch (error) {
      this.rethrowUnique(error);
      throw error;
    }
  }

  async remove(id: string, actor: SafeUser) {
    if (id === actor.id) {
      throw new BadRequestException('Anda tidak dapat menghapus akun Anda sendiri');
    }
    await this.findOne(id);
    try {
      await this.prisma.user.delete({ where: { id } });
    } catch (error) {
      // P2003 = melanggar foreign key: user sudah punya kelas / pendaftaran / pengumpulan.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        throw new ConflictException(
          'Pengguna masih memiliki data terkait (kelas, pendaftaran, atau tugas). Nonaktifkan akun sebagai gantinya.',
        );
      }
      throw error;
    }
    return { message: 'Pengguna berhasil dihapus' };
  }

  updateProfile(userId: string, dto: UpdateProfileDto): Promise<SafeUser> {
    return this.prisma.user.update({ where: { id: userId }, data: { name: dto.name }, select: USER_SELECT });
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');

    const ok = await bcrypt.compare(dto.currentPassword, user.password);
    if (!ok) throw new UnauthorizedException('Kata sandi saat ini salah');
    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException('Kata sandi baru harus berbeda dari yang lama');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS) },
    });
    return { message: 'Kata sandi berhasil diubah' };
  }

  private rethrowUnique(error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new ConflictException('Email atau NIM/NIP sudah digunakan pengguna lain');
    }
  }
}
