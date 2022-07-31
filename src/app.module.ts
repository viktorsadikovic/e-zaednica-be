import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ResidentProfileModule } from './modules/resident-profile/resident-profile.module';
import { HouseCouncilModule } from './modules/house-council/house-council.module';
import { ChatModule } from './modules/chat/chat.module';
import { AmenityModule } from './modules/amenity/amenity.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 30,
    }),
    MongooseModule.forRoot('mongodb://localhost/e-zaednica'),
    AuthModule,
    UserModule,
    ResidentProfileModule,
    HouseCouncilModule,
    ChatModule,
    AmenityModule,
    AnnouncementModule,
],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
        {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule {}
