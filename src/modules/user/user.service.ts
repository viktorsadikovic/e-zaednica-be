import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import { AuthService } from '../auth/auth.service';
import { PasswordUpdateDto } from './dto/request/passwordUpdateDto.dto';
import { UserDocument } from './schema/user.schema';
import { UserRepository } from './user.repository';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/request/updateUserDto.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
    private readonly logger: Logger,
  ) {}

  async findOneAndUpdate(
    filter: FilterQuery<UserDocument>,
    updateData: UpdateQuery<unknown>,
  ) {
    const user = await this.userRepository.findOneAndUpdate(filter, updateData);

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    return user;
  }

  async findAndUpdate(
    filter: FilterQuery<UserDocument>,
    updateData: UpdateQuery<unknown>,
  ) {
    return await this.userRepository.updateMany(filter, updateData);
  }

  async update(
    filter: FilterQuery<UserDocument>,
    updateData: UpdateQuery<unknown>,
    options?: QueryOptions<unknown>,
  ) {
    return await this.userRepository.updateMany(filter, updateData, options);
  }

  async updateUser(updateUserDto: UpdateUserDto, user: UserDocument) {
    await this.findOneAndUpdate({ _id: user._id }, updateUserDto);

    return await this.userRepository.findOneAndPopulate(
      { _id: user._id },
      {},
      [{ path: 'profiles', populate: 'houseCouncil' }],
    );
  }

  async passwordUpdate(
    passwordUpdateDto: PasswordUpdateDto,
    user: UserDocument,
  ) {
    await this.checkCorrectPassword(
      passwordUpdateDto.currentPassword,
      user.password,
      user.id,
    );
    await this.checkValidNewPassword(
      user.password,
      passwordUpdateDto.password,
      user.id,
    );
    const password = await this.authService.hashPassword(
      passwordUpdateDto.password,
    );

    await this.findOneAndUpdate({ _id: user.id }, { password });

    return { status: true };
  }

  private async checkCorrectPassword(
    currentPassword: string,
    password: string,
    userId: string,
  ) {
    if (!(await bcrypt.compare(currentPassword, password))) {
      this.logger.error(`{
        message: "Incorrent current password",
        requestUserId: '${userId}'
      }`);
      throw new UnauthorizedException('Incorrent current password');
    }
  }

  private async checkValidNewPassword(
    currentPassword: string,
    password: string,
    userId: string,
  ) {
    if (await bcrypt.compare(password, currentPassword)) {
      this.logger.error(`{
        message: "New password can not be the same as the current password",
        requestUserId: '${userId}'
      }`);
      throw new BadRequestException(
        'New password can not be the same as the current password',
      );
    }
  }
}
