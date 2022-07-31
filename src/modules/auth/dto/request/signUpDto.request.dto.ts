import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsString,
  Matches,
  MinLength,
  Validate,
} from 'class-validator';
import { IsOver18Years } from '../../../../common/validators/isOver18Years.validator';
import { Role } from '../../../user/interface/role.interface';

export class SignUpDto {
  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]{8,}$/,
    {
      message:
        'Password must contain one lowercase, one uppercase letter, special character and number',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Format: "yyyy-mm-dd". Required only if user role is PATIENT',
  })
  @IsDateString()
  @Validate(IsOver18Years)
  dob: Date;
}
