import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResidentProfileModule } from '../resident-profile/resident-profile.module';
import { ChatController } from './chat.controller';
import { ChatRepository } from './chat.repository';
import { ChatService } from './chat.service';
import { EventsGateway } from './events.gateway';
import { MessageRepository } from './message.repository';
import { Chat, ChatSchema } from './schema/chat.schema';
import { Message, MessageSchema } from './schema/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
    ResidentProfileModule,
  ],
  controllers: [ChatController],
  providers: [
    EventsGateway,
    ChatRepository,
    MessageRepository,
    ChatService,
    Logger,
  ],
  exports: [ChatService]
})
export class ChatModule {}
