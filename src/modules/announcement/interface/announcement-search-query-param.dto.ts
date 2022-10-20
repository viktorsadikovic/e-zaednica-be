import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { AnnouncementSortCriteria } from './announcement-sort-criteria.interface';

export class AnnouncementSearchQueryParams {
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

  @IsEnum(AnnouncementSortCriteria)
  @IsOptional()
  @ApiProperty({
    name: 'sort',
    type: 'string',
    enum: AnnouncementSortCriteria,
    enumName: 'AnnouncementSortCriteria',
    required: false,
  })
  sort?: AnnouncementSortCriteria =
    AnnouncementSortCriteria.DATE_CREATED_DESCENDING;
}
