import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeEmail } from '../../common/validation';

export class LoginDto {
  @ApiProperty({ example: 'admin@lms.test' })
  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @ApiProperty({ example: 'Admin12345' })
  @IsString()
  @MinLength(1, { message: 'Kata sandi wajib diisi' })
  @MaxLength(72)
  password!: string;
}
