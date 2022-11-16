import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery, ObjectId, Types, UpdateQuery } from 'mongoose';
import { ResidentProfileService } from '../resident-profile/resident-profile.service';
import { ResidentProfileDocument } from '../resident-profile/schema/resident-profile.schema';
import { ChatRepository } from './chat.repository';
import { SendMessageDto } from './dto/request/send-message.dto';
import { MessageRepository } from './message.repository';
import { Chat, ChatDocument } from './schema/chat.schema';
import { Message, MessageDocument } from './schema/message.schema';

@Injectable()
export class ChatService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly chatRepository: ChatRepository,
    private readonly residentProfileService: ResidentProfileService,
  ) {}

  async findOneAndUpdate(
    filter: FilterQuery<ChatDocument>,
    updateData: UpdateQuery<unknown>,
  ): Promise<ChatDocument> {
    const chat = await this.chatRepository.findOne(filter, {});

    if (!chat) {
      throw new NotFoundException('Chat Not Found');
    }

    return await this.chatRepository.findOneAndUpdate(filter, updateData);
  }

  async createChat(houseCouncilId: string): Promise<Chat> {
    return await this.chatRepository.create({
      houseCouncil: new Types.ObjectId(houseCouncilId),
    });
  }

  async saveMessage(sendMessageDto: SendMessageDto): Promise<MessageDocument> {
    const residentProfile: ResidentProfileDocument =
      await this.residentProfileService.findOneAndUpdate(
        { _id: sendMessageDto.resident },
        {},
      );

    const chat: ChatDocument = await this.findOneAndUpdate(
      { _id: sendMessageDto.chat },
      {},
    );

    this.checkValidChatMember(chat, residentProfile);

    return await (
      await this.messageRepository.create(sendMessageDto)
    ).populate([{ path: 'resident', populate: 'user' }]);
  }

  async getMessagesByChat(id: string) {
    return await this.messageRepository.aggregate([
      {
        $match: {
          chat: new Types.ObjectId(id),
        },
      },
      {
        $lookup: {
          from: 'residentprofiles',
          localField: 'resident',
          foreignField: '_id',
          as: 'resident',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'resident.user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          _id: 1,
          chat: 1,
          createdAt: 1,
          text: 1,
          resident: {
            $first: {
              $map: {
                input: '$resident',
                as: 'resident',
                in: {
                  _id: '$$resident._id',
                  apartmentNumber: '$$resident.apartmentNumber',
                },
              },
            },
          },
          user: {
            $first: {
              $map: {
                input: '$user',
                as: 'user',
                in: {
                  _id: '$$user._id',
                  firstName: '$$user.firstName',
                  lastName: '$$user.lastName',
                  email: '$$user.email',
                  profileImage: '$$user.profileImage',
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
    ]);
  }

  private async checkValidChatMember(
    chat: ChatDocument,
    residentProfile: ResidentProfileDocument,
  ) {
    if (
      chat.houseCouncil.toString() !== residentProfile.houseCouncil.toString()
    ) {
      throw new BadRequestException(
        'Provided resident profile is not a part of the chat',
      );
    }
  }
}
