import { forwardRef, Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatModule } from '../chat/chat.module';
import { ResidentProfileModule } from '../resident-profile/resident-profile.module';
import { UserModule } from '../user/user.module';
import { AdminRequestRepository } from './admin-request.repository';
import { HouseCouncilController } from './house-council.controller';
import { HouseCouncilRepository } from './house-council.repository';
import { HouseCouncilService } from './house-council.service';
import {
  AdminRequest,
  AdminRequestSchema,
} from './schema/admin-request.schema';
import {
  HouseCouncil,
  HouseCouncilSchema,
} from './schema/house-council.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HouseCouncil.name, schema: HouseCouncilSchema },
      { name: AdminRequest.name, schema: AdminRequestSchema },
    ]),
    ResidentProfileModule,
    UserModule,
    ChatModule,
  ],
  controllers: [HouseCouncilController],
  providers: [
    HouseCouncilService,
    HouseCouncilRepository,
    AdminRequestRepository,
    Logger,
  ],
  exports: [HouseCouncilService, HouseCouncilRepository],
})
export class HouseCouncilModule {}
