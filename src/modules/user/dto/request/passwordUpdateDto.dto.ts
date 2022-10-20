import { ApiProperty } from '@nestjs/swagger';
import { Matches, MinLength } from 'class-validator';
import { Match } from '../../../../common/decorators/match.decorator';

export class PasswordUpdateDto {
  @ApiProperty()
  @MinLength(8, {
    message: 'Invalid current password',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]{8,}$/,
    {
      message: 'Invalid current password',
    },
  )
  currentPassword: string;

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

  @ApiProperty()
  @MinLength(8)
  @Match('password')
  confirmedPassword: string;
}
