import { Controller, Get, Query } from '@nestjs/common';
import { User } from '../../common/decorators/user.decorator';
import { UserDocument } from '../user/schema/user.schema';
import { NotificationQueryParams } from './dto/request/notification-query-params-dto.dto';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('')
  async getNotifications(
    @Query() params: NotificationQueryParams,
    @User() user: UserDocument,
  ) {
    return await this.notificationService.getNotifications(params.type, user);
  }

  @Get('/mark-as-read')
  async markNotificationsAsRead(
    @Query() params: NotificationQueryParams,
    @User() user: UserDocument,
  ) {
    return await this.notificationService.markAsRead(params.type, user);
  }
}
