import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsString, Validate } from 'class-validator';
import { IsOver18Years } from '../../../../common/validators/isOver18Years.validator';

export class UpdateUserDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Format: "yyyy-mm-dd"',
  })
  @IsDateString()
  @Validate(IsOver18Years)
  dob: Date;

  @ApiPropertyOptional()
  @IsString()
  profileImage: string;
}
