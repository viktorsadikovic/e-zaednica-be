import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId } from 'class-validator';
import { ResidentProfileStatus } from '../../interface/resident-profile-status.interface';

export class ChangeResidentProfileStatusDto {
  @ApiProperty()
  @IsMongoId()
  profileId: string;

  @ApiProperty()
  @IsEnum(ResidentProfileStatus)
  status: ResidentProfileStatus;
}
