import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsString,
  Validate,
  ValidateIf,
} from 'class-validator';
import { IsAfterConstraint } from '../../../../common/validators/isAfterDate.validator';
import { IsBeforeConstraint } from '../../../../common/validators/isBeforeDate.validator';
import { IsInThePastConstraint } from '../../../../common/validators/isInThePast.validator';
import { Repeat } from '../../interface/repeat.interface';

export class CreateEditAmenityDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsBoolean()
  recurring: boolean;

  @ApiProperty()
  @IsEnum(Repeat)
  @ValidateIf((o) => o.recurring === true)
  repeat: Repeat;

  @ApiProperty()
  @IsDateString()
  @ValidateIf((o) => o.recurring === true)
  @Validate(IsInThePastConstraint)
  @Validate(IsBeforeConstraint, ['endDate'])
  startDate: Date;

  @ApiProperty()
  @IsDateString()
  @ValidateIf((o) => o.recurring === true)
  @Validate(IsInThePastConstraint)
  @Validate(IsAfterConstraint, ['dueDate'])
  endDate: Date;

  @ApiProperty()
  @IsDateString()
  @ValidateIf((o) => o.recurring === false)
  @Validate(IsAfterConstraint, ['startDate'])
  dueDate: Date;
}
