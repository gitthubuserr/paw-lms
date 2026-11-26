import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = { user: { create: jest.fn(), findUnique: jest.fn() } };
  const jwt = { signAsync: jest.fn().mockResolvedValue('signed.jwt.token') };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  const baseUser = (over: Record<string, unknown> = {}) => ({
    id: 'u1',
    name: 'Budi',
    email: 'budi@mail.test',
    password: bcrypt.hashSync('Rahasia123', 4),
    role: Role.STUDENT,
    identityNumber: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...over,
  });

  describe('register', () => {
    it('selalu membuat role STUDENT dan menyimpan password dalam bentuk hash', async () => {
      prisma.user.create.mockImplementation(({ data }) => Promise.resolve({ id: 'u1', ...data }));
      await service.register({ name: 'Budi', email: 'budi@mail.test', password: 'Rahasia123' });

      const data = prisma.user.create.mock.calls[0][0].data;
      expect(data.role).toBe(Role.STUDENT);
      expect(data.password).not.toBe('Rahasia123');
      expect(await bcrypt.compare('Rahasia123', data.password)).toBe(true);
    });

    it('melempar ConflictException saat email/NIM sudah terdaftar', async () => {
      prisma.user.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('dup', { code: 'P2002', clientVersion: 'test' }),
      );
      await expect(
        service.register({ name: 'Budi', email: 'budi@mail.test', password: 'Rahasia123' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('mengembalikan token dan user tanpa field password', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser());
      const result = await service.login({ email: 'budi@mail.test', password: 'Rahasia123' });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user).not.toHaveProperty('password');
      expect(jwt.signAsync).toHaveBeenCalledWith({ sub: 'u1', role: Role.STUDENT });
    });

    it('menolak password salah dengan pesan yang sama seperti email tidak ditemukan', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser());
      const wrongPassword = service.login({ email: 'budi@mail.test', password: 'Salah12345' });
      await expect(wrongPassword).rejects.toThrow('Email atau kata sandi salah');

      prisma.user.findUnique.mockResolvedValue(null);
      const unknownEmail = service.login({ email: 'x@mail.test', password: 'Rahasia123' });
      await expect(unknownEmail).rejects.toBeInstanceOf(UnauthorizedException);
      await expect(unknownEmail).rejects.toThrow('Email atau kata sandi salah');
    });

    it('menolak akun nonaktif walau password benar', async () => {
      prisma.user.findUnique.mockResolvedValue(baseUser({ isActive: false }));
      await expect(
        service.login({ email: 'budi@mail.test', password: 'Rahasia123' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(jwt.signAsync).not.toHaveBeenCalled();
    });
  });
});
