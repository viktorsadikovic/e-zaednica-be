import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { NotificationType } from '../../interface/notification-type.interface';

export class NotificationQueryParams {
  @IsEnum(NotificationType)
  @ApiProperty({
    name: 'type',
    type: 'type',
    enum: NotificationType,
    enumName: 'NotificationType',
    required: false,
  })
  type: NotificationType;
}
