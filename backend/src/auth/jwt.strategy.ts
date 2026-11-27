import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ACCESS_COOKIE } from '../common/constants';
import { SafeUser, USER_SELECT } from '../common/user';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private readonly prisma: PrismaService) {
    super({
      // 1) cookie httpOnly (dipakai browser)  2) header Bearer (Postman, tes otomatis)
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[ACCESS_COOKIE] ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  /**
   * Dipanggil setiap request setelah tanda tangan token valid.
   * User dibaca ulang dari DB agar perubahan role / penonaktifan akun
   * langsung berlaku tanpa menunggu token kedaluwarsa. Hasil return
   * ini menjadi `request.user`.
   */
  async validate(payload: JwtPayload): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: USER_SELECT,
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Akun tidak ditemukan atau dinonaktifkan');
    }
    return user;
  }
}
