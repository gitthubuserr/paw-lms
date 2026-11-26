import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import {
  emptyToUndefined,
  IDENTITY_MESSAGE,
  IDENTITY_REGEX,
  normalizeEmail,
  PASSWORD_MESSAGE,
  PASSWORD_REGEX,
  trim,
} from '../../common/validation';

/** Dipakai ADMIN untuk membuat akun apa pun (termasuk Dosen & Admin lain). */
export class CreateUserDto {
  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(100)
  name!: string;

  @ApiProperty() @Transform(normalizeEmail) @IsEmail({}, { message: 'Format email tidak valid' }) @MaxLength(150)
  email!: string;

  @ApiProperty({ enum: Role }) @IsEnum(Role, { message: 'Role harus ADMIN, LECTURER, atau STUDENT' })
  role!: Role;

  @ApiPropertyOptional({ description: 'NIM / NIP' })
  @Transform(emptyToUndefined) @IsOptional() @Matches(IDENTITY_REGEX, { message: IDENTITY_MESSAGE })
  identityNumber?: string;

  @ApiProperty() @IsString() @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password!: string;
}
