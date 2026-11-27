import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { trim } from '../../common/validation';

/** Profil sendiri: hanya nama. Email/role/NIM diubah lewat admin agar identitas akademik tidak bisa diubah sendiri. */
export class UpdateProfileDto {
  @ApiProperty() @Transform(trim) @IsString() @MinLength(2) @MaxLength(100)
  name!: string;
}
