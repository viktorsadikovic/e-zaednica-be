import { forwardRef, Logger, Module } from '@nestjs/common';
import { AmenityService } from './amenity.service';
import { AmenityController } from './amenity.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Amenity, AmenitySchema } from './schema/amenity.schema';
import { AmenityRepository } from './amenity.repository';
import { HouseCouncilModule } from '../house-council/house-council.module';
import { ResidentProfileModule } from '../resident-profile/resident-profile.module';
import { AmenityItemModule } from '../amenity-item/amenity-item.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Amenity.name, schema: AmenitySchema }]),
    ResidentProfileModule,
    forwardRef(() => AmenityItemModule),
  ],
  providers: [AmenityService, AmenityRepository, Logger],
  controllers: [AmenityController],
  exports: [AmenityRepository],
})
export class AmenityModule {}
