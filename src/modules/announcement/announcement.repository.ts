import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repository/baseRepository.repository';
import {
  Announcement,
  AnnouncementDocument,
} from './schema/announcement.schema';

@Injectable()
export class AnnouncementRepository extends BaseRepository<AnnouncementDocument> {
  constructor(
    @InjectModel(Announcement.name)
    private announcementModel: Model<AnnouncementDocument>,
  ) {
    super(announcementModel);
  }
}
