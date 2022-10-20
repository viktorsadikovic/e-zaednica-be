import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNumber } from 'class-validator';

export class JoinHouseCouncilDto {
  @ApiProperty()
  @IsMongoId({ message: 'Invalid code' })
  houseCouncilId: string;

  @ApiProperty()
  @IsNumber()
  apartmentNumber: number;
}
