import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../../common/decorators/user.decorator';
import { PasswordUpdateDto } from './dto/request/passwordUpdateDto.dto';
import { UpdateUserDto } from './dto/request/updateUserDto.dto';
import { UserDocument } from './schema/user.schema';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('user')
@ApiBearerAuth('accessToken')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('/update')
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @User() user: UserDocument,
  ) {
    return await this.userService.updateUser(updateUserDto, user);
  }

  @Post('/password-change')
  async changePassword(
    @Body() passwordUpdateDto: PasswordUpdateDto,
    @User() user: UserDocument,
  ) {
    return await this.userService.passwordUpdate(passwordUpdateDto, user);
  }
}
