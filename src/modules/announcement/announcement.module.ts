import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationModule } from '../notification/notification.module';
import { ResidentProfileModule } from '../resident-profile/resident-profile.module';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementRepository } from './announcement.repository';
import { AnnouncementService } from './announcement.service';
import { Announcement, AnnouncementSchema } from './schema/announcement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Announcement.name, schema: AnnouncementSchema },
    ]),
    NotificationModule,
    ResidentProfileModule,
  ],
  controllers: [AnnouncementController],
  providers: [AnnouncementService, AnnouncementRepository, Logger],
  exports: [AnnouncementService, AnnouncementRepository],
})
export class AnnouncementModule {}
