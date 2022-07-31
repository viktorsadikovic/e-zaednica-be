import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repository/baseRepository.repository';
import { SignUpDto } from '../auth/dto/request/signUpDto.request.dto';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel);
  }

  // async findOne(email: String): Promise<UserDocument> {
  //   return await this.userModel.findOne({ email: email }, {});
  // }

  // async save(user: SignUpDto): Promise<UserDocument> {
  //   return await this.userModel.create(user);
  // }
}
