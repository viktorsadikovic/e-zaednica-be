import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HouseCouncilModule } from '../house-council/house-council.module';
import { UserModule } from '../user/user.module';
import { ResidentProfileController } from './resident-profile.controller';
import { ResidentProfileRepository } from './resident-profile.repository';
import { ResidentProfileService } from './resident-profile.service';
import {
  ResidentProfile,
  ResidentProfileSchema,
} from './schema/resident-profile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ResidentProfile.name, schema: ResidentProfileSchema },
    ]),
    UserModule,
  ],
  controllers: [ResidentProfileController],
  providers: [ResidentProfileService, ResidentProfileRepository, Logger],
  exports: [ResidentProfileService, ResidentProfileRepository],
})
export class ResidentProfileModule {}
