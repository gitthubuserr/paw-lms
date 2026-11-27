import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../../common/validation';

export class ChangePasswordDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(72)
  currentPassword!: string;

  @ApiProperty() @IsString() @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  newPassword!: string;
}
