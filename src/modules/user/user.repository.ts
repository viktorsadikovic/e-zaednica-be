import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../common/repository/baseRepository.repository';
import { SignUpDto } from '../auth/dto/request/signUpDto.request.dto';
import { UsersToken } from './interface/token.interface';
import { User, UserDocument } from './schema/user.schema';

@Injectable()
export class UserRepository extends BaseRepository<UserDocument> {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super(userModel);
  }

  async requestedTokensInPast(email: string): Promise<Array<UsersToken>> {
    const PAST_MINUTES = 10;
    return await this.entityModel.aggregate([
      {
        $match: {
          email,
        },
      },
      {
        $project: {
          tokens: {
            $filter: {
              input: '$tokens',
              as: 't',
              cond: {
                $gt: [
                  '$$t.createdAt',
                  new Date(Date.now() - PAST_MINUTES * 60 * 1000),
                ],
              },
            },
          },
        },
      },
    ]);
  }

  async validationToken(
    userId: string,
    token: string,
  ): Promise<Array<UsersToken>> {
    return await this.entityModel.aggregate([
      {
        $match: {
          _id: new Types.ObjectId(userId),
        },
      },
      {
        $project: {
          tokens: {
            $filter: {
              input: '$tokens',
              as: 't',
              cond: {
                $eq: ['$$t.token', token],
              },
            },
          },
        },
      },
    ]);
  }
}
