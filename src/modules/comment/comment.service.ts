import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { AnnouncementService } from '../announcement/announcement.service';
import { AnnouncementDocument } from '../announcement/schema/announcement.schema';
import { Role } from '../user/interface/role.interface';
import { UserDocument } from '../user/schema/user.schema';
import { CommentRepository } from './comment.repository';
import { AddCommentDto } from './dto/request/addCommentDto.dto';
import { CommentDocument } from './schema/comment.schema';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly announcementService: AnnouncementService,
  ) {}

  async findOneAndUpdate(
    filter: FilterQuery<CommentDocument>,
    updateData: UpdateQuery<unknown>,
  ) {
    const comment = await this.commentRepository.findOne(filter, {});

    if (!comment) {
      throw new NotFoundException('Comment Not Found');
    }

    return await this.commentRepository.findOneAndUpdate(filter, updateData);
  }

  async findAndUpdate(
    filter: FilterQuery<CommentDocument>,
    updateData: UpdateQuery<unknown>,
  ) {
    return this.commentRepository.updateMany(filter, updateData);
  }

  async findByAnnouncement(id: string) {
    await this.announcementService.findOneAndUpdate({ _id: id }, {});
    return await this.commentRepository.findAndPopulate({ announcement: id }, [
      { path: 'resident', populate: 'user' },
    ]);
  }

  async addComment(
    announcementId: string,
    addCommentDto: AddCommentDto,
    user: UserDocument,
  ) {
    await this.announcementService.findOneAndUpdate(
      { _id: announcementId },
      {},
    );
    // CHECK IF CURRENT PROFILE BELONGS TO ANNOUNCEMENTS HOUSE COUNCIL

    const comment = {
      ...addCommentDto,
      announcement: announcementId,
      resident: user.activeProfile._id,
    };

    return await (
      await this.commentRepository.create(comment)
    ).populate([{ path: 'resident', populate: 'user' }]);
  }

  async deleteComment(id: string, user: UserDocument) {
    const comment = await (
      await this.findOneAndUpdate({ _id: id }, {})
    ).populate('announcement');

    await this.checkAccessPermission(comment, user);

    return this.commentRepository.deleteMany({ _id: id });
  }

  async checkAccessPermission(comment: CommentDocument, user: UserDocument) {
    if (
      user.role !== Role.ADMIN &&
      !user.profiles.includes(comment.resident) &&
      !user.profiles.includes(comment.announcement['resident'])
    ) {
      throw new ForbiddenException(
        'You Do Not Have Permission To Perform This Action',
      );
    }
  }
}
