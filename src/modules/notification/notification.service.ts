import { Injectable } from '@nestjs/common';
import { ResidentProfileStatus } from '../resident-profile/interface/resident-profile-status.interface';
import { ResidentProfileDocument } from '../resident-profile/schema/resident-profile.schema';
import { UserDocument } from '../user/schema/user.schema';
import { NotificationType } from './interface/notification-type.interface';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async sendNotification(
    residentId: string,
    type: NotificationType,
    residents: ResidentProfileDocument[],
  ) {
    const notificationsToCreate = residents
      .filter(
        (resident) =>
          resident._id.toString() !== residentId.toString() &&
          resident.status === ResidentProfileStatus.APPROVED,
      )
      .map((resident) => {
        return {
          insertOne: {
            document: {
              type: type,
              profile: resident._id,
              seen: false,
            },
          },
        };
      });

    await this.notificationRepository.bulkWrite(notificationsToCreate);
  }

  async getNotifications(type: NotificationType, user: UserDocument) {
    return await this.notificationRepository.aggregate([
      {
        $match: {
          type: type,
          profile: user.activeProfile._id,
          seen: false,
        },
      },
      {
        $count: 'notifications',
      },
    ]);
  }

  async markAsRead(type: NotificationType, user: UserDocument) {
    return await this.notificationRepository.updateMany(
      {
        type: type,
        profile: user.activeProfile._id,
      },
      {
        seen: true,
      },
    );
  }
}
