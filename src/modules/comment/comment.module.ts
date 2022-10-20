import { Logger, Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment, CommentSchema } from './schema/comment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentRepository } from './comment.repository';
import { AnnouncementModule } from '../announcement/announcement.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    AnnouncementModule,
  ],
  providers: [CommentService, CommentRepository, Logger],
  controllers: [CommentController],
  exports: [CommentService, CommentRepository],
})
export class CommentModule {}
