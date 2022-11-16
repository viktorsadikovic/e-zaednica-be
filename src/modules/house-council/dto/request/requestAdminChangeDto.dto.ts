import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class RequestAdminChangeDto {
  @ApiProperty()
  @IsMongoId()
  residentId: string;
}
