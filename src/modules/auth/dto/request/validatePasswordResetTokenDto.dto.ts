import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, Length } from 'class-validator';

export class ValidatePasswordResetTokenDto {
  @ApiProperty()
  @IsString()
  @Length(6, 6, {
    message: 'Token must be exactly 6 characters',
  })
  token: string;

  @ApiProperty()
  @IsMongoId()
  userId: string;
}
