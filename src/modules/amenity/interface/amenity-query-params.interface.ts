import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ToBoolean } from '../../../common/validators/convertToBoolean.validator';
import { AmenitySortCriteria } from './amenity-sort-criteria.interface';
import { AmenityStatus } from './amenity-status.interface';

export class AmenityQueryParams {
  @IsEnum(AmenityStatus)
  @IsOptional()
  @ApiProperty({
    name: 'status',
    type: 'string',
    enum: AmenityStatus,
    enumName: 'AmenityStatus',
    required: false,
  })
  status?: AmenityStatus;

  @IsBoolean()
  @IsOptional()
  @ToBoolean()
  @ApiProperty({
    name: 'recurring',
    type: 'boolean',
    required: false,
  })
  recurring?: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({
    name: 'search',
    type: 'string',
    required: false,
  })
  search?: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    name: 'page',
    type: 'number',
    required: false,
  })
  page?: number = 0;

  @IsEnum(AmenitySortCriteria)
  @IsOptional()
  @ApiProperty({
    name: 'sort',
    type: 'string',
    enum: AmenitySortCriteria,
    enumName: 'AmenitySortCriteria',
    required: false,
  })
  sort?: AmenitySortCriteria = AmenitySortCriteria.DATE_CREATED_DESCENDING;
}
