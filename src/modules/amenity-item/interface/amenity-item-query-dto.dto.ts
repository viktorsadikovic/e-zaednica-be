import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { AmenityItemSortCriteria } from './amenity-item-sort-criteria.interface';
import { AmenityItemStatus } from './amenity-item-status.interface';

export class AmenityItemQueryDto {
  @IsEnum(AmenityItemStatus)
  @IsOptional()
  @ApiProperty({
    name: 'status',
    type: 'string',
    enum: AmenityItemStatus,
    enumName: 'AmenityItemStatus',
    required: false,
  })
  status?: AmenityItemStatus;

  @IsMongoId()
  @ApiProperty({
    required: false,
  })
  resident?: string;

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

  @IsEnum(AmenityItemSortCriteria)
  @IsOptional()
  @ApiProperty({
    name: 'sort',
    type: 'string',
    enum: AmenityItemSortCriteria,
    enumName: 'AmenityItemSortCriteria',
    required: false,
  })
  sort?: AmenityItemSortCriteria =
    AmenityItemSortCriteria.DATE_CREATED_DESCENDING;
}
