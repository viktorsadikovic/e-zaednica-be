import { forwardRef, Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from '../chat/chat.module';
import { ResidentProfileModule } from '../resident-profile/resident-profile.module';
import { UserModule } from '../user/user.module';
import { HouseCouncilController } from './house-council.controller';
import { HouseCouncilRepository } from './house-council.repository';
import { HouseCouncilService } from './house-council.service';
import {
  HouseCouncil,
  HouseCouncilSchema,
} from './schema/house-council.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HouseCouncil.name, schema: HouseCouncilSchema },
    ]),
    ResidentProfileModule,
    UserModule,
    ChatModule,
  ],
  controllers: [HouseCouncilController],
  providers: [HouseCouncilService, HouseCouncilRepository, Logger],
  exports: [HouseCouncilService, HouseCouncilRepository],
})
export class HouseCouncilModule {}
