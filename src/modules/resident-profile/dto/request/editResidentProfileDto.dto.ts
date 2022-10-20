import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber } from 'class-validator';

export class EditResidentProfileDto {
  // @ApiProperty()
  // @IsMongoId()
  // residentProfile: string;

  @ApiProperty()
  @IsNumber()
  apartmentNumber: number;
}
