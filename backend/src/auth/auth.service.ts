import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../common/constants';
import { SafeUser, toSafeUser, USER_SELECT } from '../common/user';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  // Hash palsu agar waktu respons login sama baik email ada maupun tidak
  // (mencegah user enumeration lewat timing attack).
  private readonly dummyHash = bcrypt.hashSync('timing-attack-protection', BCRYPT_ROUNDS);

  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}

  async register(dto: RegisterDto): Promise<SafeUser> {
    const password = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    try {
      return await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password,
          identityNumber: dto.identityNumber,
          role: Role.STUDENT, // registrasi publik SELALU mahasiswa
        },
        select: USER_SELECT,
      });
    } catch (error) {
      // Mengandalkan unique constraint DB (bebas race condition) dibanding cek manual lalu insert.
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email atau NIM/NIP sudah terdaftar');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{ user: SafeUser; accessToken: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    const passwordOk = await bcrypt.compare(dto.password, user?.password ?? this.dummyHash);
    if (!user || !passwordOk) {
      // Pesan sama untuk "email salah" dan "password salah".
      throw new UnauthorizedException('Email atau kata sandi salah');
    }
    if (!user.isActive) {
      throw new ForbiddenException('Akun Anda dinonaktifkan. Hubungi administrator.');
    }

    const accessToken = await this.jwt.signAsync({ sub: user.id, role: user.role });
    return { user: toSafeUser(user), accessToken };
  }
}
