import { Logger } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/request/send-message.dto';
import { MessageDocument } from './schema/message.schema';

@SkipThrottle()
@WebSocketGateway(3333, { cors: '*' })
export class EventsGateway implements OnGatewayInit {
  constructor(
    private readonly chatService: ChatService,
    private readonly logger: Logger,
  ) {}

  @WebSocketServer()
  server;

  afterInit(server: any) {
    this.logger.log('Gateway Initialized');
  }

  @SubscribeMessage('message')
  async handleEvent(@MessageBody() data: SendMessageDto) {
    const message: MessageDocument = await this.chatService.saveMessage(data);
    this.server.emit(`message-${message.resident['houseCouncil']}`, message);
  }
}
