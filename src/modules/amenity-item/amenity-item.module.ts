import { forwardRef, Logger, Module } from '@nestjs/common';
import { AmenityItemController } from './amenity-item.controller';
import { AmenityItemRepository } from './amenity-item.repository';
import { AmenityItemService } from './amenity-item.service';
import { AmenityItem, AmenityItemSchema } from './schema/amenity-item.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AmenityModule } from '../amenity/amenity.module';
import { ResidentProfileModule } from '../resident-profile/resident-profile.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AmenityItem.name, schema: AmenityItemSchema },
    ]),
    forwardRef(() => AmenityModule),
    ResidentProfileModule,
  ],
  providers: [AmenityItemService, AmenityItemRepository, Logger],
  exports: [AmenityItemService, AmenityItemRepository],
  controllers: [AmenityItemController],
})
export class AmenityItemModule {}
