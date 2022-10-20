import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty()
  @IsMongoId()
  resident: string;

  @ApiProperty()
  @IsMongoId()
  chat: string;

  @ApiProperty()
  @IsString()
  text: string;
}
