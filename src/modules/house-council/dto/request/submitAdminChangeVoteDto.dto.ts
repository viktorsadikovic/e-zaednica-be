import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class SubmitAdminChangeVoteDto {
  @ApiProperty()
  @IsMongoId()
  residentId: string;
}
