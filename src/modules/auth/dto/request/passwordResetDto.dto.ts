import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsString, Matches, MinLength } from 'class-validator';
import { Match } from '../../../../common/decorators/match.decorator';

export class PasswordResetDto {
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]{8,}$/,
    {
      message:
        'Password must contain one lowercase, one uppercase letter, special character and number',
    },
  )
  password: string;

  @ApiProperty()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]{8,}$/,
    {
      message:
        'Confirmed password must contain one lowercase, one uppercase letter, special character and number',
    },
  )
  @Match('password')
  confirmedPassword: string;

  @ApiProperty()
  @IsMongoId()
  userId: string;
}
