import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repository/baseRepository.repository';
import {
  HouseCouncil,
  HouseCouncilDocument,
} from './schema/house-council.schema';

@Injectable()
export class HouseCouncilRepository extends BaseRepository<HouseCouncilDocument> {
  constructor(
    @InjectModel(HouseCouncil.name)
    private houseCouncilModel: Model<HouseCouncilDocument>,
  ) {
    super(houseCouncilModel);
  }
}
