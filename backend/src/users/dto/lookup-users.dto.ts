import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class LookupUsersDto {
  @ApiPropertyOptional({ enum: [Role.LECTURER, Role.STUDENT] })
  @IsOptional() @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100)
  search?: string;
}
