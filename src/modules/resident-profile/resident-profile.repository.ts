import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseRepository } from '../../common/repository/baseRepository.repository';
import {
  ResidentProfile,
  ResidentProfileDocument,
} from './schema/resident-profile.schema';

@Injectable()
export class ResidentProfileRepository extends BaseRepository<ResidentProfileDocument> {
  constructor(
    @InjectModel(ResidentProfile.name)
    private residentProfileModel: Model<ResidentProfileDocument>,
  ) {
    super(residentProfileModel);
  }

  async find(filter: FilterQuery<ResidentProfile>) {
    return await this.entityModel.aggregate([
      {
        $match: filter,
      },
    ]);
  }
}
