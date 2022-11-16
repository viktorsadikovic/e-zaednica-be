import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HasActiveProfileGuard } from './common/guards/active-profile.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AmenityItemModule } from './modules/amenity-item/amenity-item.module';
import { AmenityModule } from './modules/amenity/amenity.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { CommentModule } from './modules/comment/comment.module';
import { HouseCouncilModule } from './modules/house-council/house-council.module';
import { ResidentProfileModule } from './modules/resident-profile/resident-profile.module';
import { UserModule } from './modules/user/user.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 1000,
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot('mongodb://localhost/e-zaednica'),
    AuthModule,
    UserModule,
    ResidentProfileModule,
    HouseCouncilModule,
    ChatModule,
    AmenityModule,
    AnnouncementModule,
    CommentModule,
    AmenityItemModule,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.example.com',
        secure: false,
        auth: {
          user: 'viktor',
          pass: 'test',
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@nestjs.com>',
      },
    }),
    NotificationModule,
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
    {
      provide: APP_GUARD,
      useClass: HasActiveProfileGuard,
    },
    Logger,
  ],
})
export class AppModule {}
