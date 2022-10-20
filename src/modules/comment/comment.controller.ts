import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../../common/decorators/user.decorator';
import { ValidateMongoId } from '../../common/pipes/validateMongoId.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { CommentService } from './comment.service';
import { AddCommentDto } from './dto/request/addCommentDto.dto';

@Controller('comment')
@ApiTags('comment')
@ApiBearerAuth('accessToken')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @Get('/by-announcement/:announcementId')
  async getCommentsByAnnouncement(
    @Param('announcementId', ValidateMongoId) id: string,
  ) {
    return await this.commentService.findByAnnouncement(id);
  }

  @Get('/:id')
  async getComment(@Param('id', ValidateMongoId) id: string) {
    return await this.commentService.findOneAndUpdate({ _id: id }, {});
  }

  @Post('/add/:announcementId')
  async addComment(
    @Param('announcementId', ValidateMongoId) announcementId: string,
    @Body() addCommentDto: AddCommentDto,
    @User() user: UserDocument,
  ) {
    return await this.commentService.addComment(
      announcementId,
      addCommentDto,
      user,
    );
  }

  @Delete('/delete/:id')
  async deleteComment(
    @Param('id', ValidateMongoId) id: string,
    @User() user: UserDocument,
  ) {
    return await this.commentService.deleteComment(id, user);
  }
}
