import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../common/repository/baseRepository.repository';
import { Comment, CommentDocument } from './schema/comment.schema';

@Injectable()
export class CommentRepository extends BaseRepository<CommentDocument> {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: Model<CommentDocument>,
  ) {
    super(commentModel);
  }
}
