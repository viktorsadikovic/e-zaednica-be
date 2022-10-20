import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repository/baseRepository.repository';
import { AmenityItem, AmenityItemDocument } from './schema/amenity-item.schema';

@Injectable()
export class AmenityItemRepository extends BaseRepository<AmenityItemDocument> {
  constructor(
    @InjectModel(AmenityItem.name)
    private amenityItemModel: Model<AmenityItemDocument>,
  ) {
    super(amenityItemModel);
  }
}
