import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AmenityVoteType } from '../../interface/amenity-vote-type.interface';

export class AmenityVoteQueryDto {
  @IsEnum(AmenityVoteType)
  @ApiProperty({
    name: 'amenityVoteType',
    type: 'string',
    enum: AmenityVoteType,
    enumName: 'AmenityVoteType',
  })
  amenityVoteType: AmenityVoteType;
}
