import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListUsersDto {
  @ApiPropertyOptional({ default: 1 }) @Type(() => Number) @IsOptional() @IsInt() @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10, maximum: 100 }) @Type(() => Number) @IsOptional() @IsInt() @Min(1) @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Cari nama / email / NIM-NIP' })
  @IsOptional() @IsString() @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: Role }) @IsOptional() @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsOptional() @IsBoolean()
  isActive?: boolean;
}
