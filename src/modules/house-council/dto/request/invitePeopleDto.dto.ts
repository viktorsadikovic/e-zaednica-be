import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class InvitePeopleDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
