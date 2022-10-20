import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repository/baseRepository.repository';
import { Chat, ChatDocument } from './schema/chat.schema';

@Injectable()
export class ChatRepository extends BaseRepository<ChatDocument> {
  constructor(
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
  ) {
    super(chatModel);
  }
}
