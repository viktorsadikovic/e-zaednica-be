import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HasActiveProfile } from '../../common/decorators/active-profile.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ValidateMongoId } from '../../common/pipes/validateMongoId.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { ChatService } from './chat.service';

@Controller('chat')
@ApiTags('chat')
@ApiBearerAuth('accessToken')
@HasActiveProfile()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('')
  async getActiveChat(@User() user: UserDocument) {
    return await this.chatService.findOneAndUpdate(
      { houseCouncil: user.activeProfile['houseCouncil'] },
      {},
    );
  }

  @Get('/:id')
  async getMessagesByChat(@Param('id', ValidateMongoId) id: string) {
    return await this.chatService.getMessagesByChat(id);
  }
}
