import { Body, Controller, Get, HttpCode, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { ACCESS_COOKIE } from '../common/constants';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { SafeUser } from '../common/user';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@ApiBearerAuth()
@ApiCookieAuth(ACCESS_COOKIE)
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly config: ConfigService) {}

  private get cookieOptions() {
    const ttlSeconds = Number(this.config.get('JWT_EXPIRES_IN_SECONDS') ?? 86400);
    return {
      httpOnly: true, // tidak bisa dibaca JavaScript -> kebal pencurian token via XSS
      sameSite: 'lax' as const, // mitigasi CSRF untuk request lintas situs
      secure: this.config.get('COOKIE_SECURE') === 'true', // true saat HTTPS
      path: '/',
      maxAge: ttlSeconds * 1000,
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Registrasi mahasiswa (role selalu STUDENT)' })
  async register(@Body() dto: RegisterDto) {
    const user = await this.auth.register(dto);
    return { user };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @HttpCode(200)
  @Post('login')
  @ApiOperation({ summary: 'Login; token dikirim sebagai cookie httpOnly' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken } = await this.auth.login(dto);
    res.cookie(ACCESS_COOKIE, accessToken, this.cookieOptions);
    return { user };
  }

  // Public agar cookie tetap bisa dihapus walau token sudah kedaluwarsa.
  @Public()
  @HttpCode(200)
  @Post('logout')
  @ApiOperation({ summary: 'Logout: menghapus cookie sesi' })
  logout(@Res({ passthrough: true }) res: Response) {
    const { maxAge: _maxAge, ...options } = this.cookieOptions;
    res.clearCookie(ACCESS_COOKIE, options);
    return { message: 'Berhasil keluar' };
  }

  @Get('me')
  @ApiOperation({ summary: 'Data user yang sedang login' })
  me(@CurrentUser() user: SafeUser) {
    return { user };
  }
}
