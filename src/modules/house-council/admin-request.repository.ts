import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repository/baseRepository.repository';
import {
  AdminRequest,
  AdminRequestDocument,
} from './schema/admin-request.schema';

@Injectable()
export class AdminRequestRepository extends BaseRepository<AdminRequestDocument> {
  constructor(
    @InjectModel(AdminRequest.name)
    private adminRequestModel: Model<AdminRequestDocument>,
  ) {
    super(adminRequestModel);
  }
}
