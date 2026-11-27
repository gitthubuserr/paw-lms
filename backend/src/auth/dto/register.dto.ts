import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  emptyToUndefined,
  IDENTITY_MESSAGE,
  IDENTITY_REGEX,
  normalizeEmail,
  PASSWORD_MESSAGE,
  PASSWORD_REGEX,
  trim,
} from '../../common/validation';

/**
 * Sengaja TIDAK ada field `role`. Registrasi publik selalu menghasilkan
 * STUDENT. Dengan ValidationPipe(forbidNonWhitelisted) klien yang mencoba
 * mengirim "role":"ADMIN" akan ditolak -> mencegah privilege escalation.
 */
export class RegisterDto {
  @ApiProperty({ example: 'Budi Santoso' })
  @Transform(trim)
  @IsString()
  @MinLength(2, { message: 'Nama minimal 2 karakter' })
  @MaxLength(100, { message: 'Nama maksimal 100 karakter' })
  name!: string;

  @ApiProperty({ example: 'budi@student.uinsgd.ac.id' })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Format email tidak valid' })
  @MaxLength(150)
  email!: string;

  @ApiPropertyOptional({ example: '1237050001', description: 'NIM' })
  @Transform(emptyToUndefined)
  @IsOptional()
  @Matches(IDENTITY_REGEX, { message: IDENTITY_MESSAGE })
  identityNumber?: string;

  @ApiProperty({ example: 'Rahasia123' })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password!: string;
}
