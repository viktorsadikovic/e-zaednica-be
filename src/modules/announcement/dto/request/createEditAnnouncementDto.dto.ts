import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateEditAnnouncementDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  files: string[];
}
