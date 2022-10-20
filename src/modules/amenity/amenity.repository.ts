import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repository/baseRepository.repository';
import { Amenity, AmenityDocument } from './schema/amenity.schema';

@Injectable()
export class AmenityRepository extends BaseRepository<AmenityDocument> {
  constructor(
    @InjectModel(Amenity.name)
    private amenityModel: Model<AmenityDocument>,
  ) {
    super(amenityModel);
  }
}
