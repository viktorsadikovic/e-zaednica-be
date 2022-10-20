import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AnnouncementVoteType } from './announcement-vote-type.interface';

export class AnnouncementVoteQueryParam {
  @ApiProperty({
    name: 'type',
    type: 'string',
    enum: AnnouncementVoteType,
    enumName: 'Type',
    required: false,
  })
  @IsEnum(AnnouncementVoteType)
  type: AnnouncementVoteType;
}
