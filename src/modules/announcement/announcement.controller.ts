import {
  Body,
  Controller,
  Delete,
  Get,
  Param, Post,
  Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HasActiveProfile } from '../../common/decorators/active-profile.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ValidateAnnouncementVoteType } from '../../common/pipes/validateAnnouncementVoteType.pipe';
import { ValidateMongoId } from '../../common/pipes/validateMongoId.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { AnnouncementService } from './announcement.service';
import { CreateEditAnnouncementDto } from './dto/request/createEditAnnouncementDto.dto';
import { AnnouncementSearchQueryParams } from './interface/announcement-search-query-param.dto';
import { AnnouncementVoteType } from './interface/announcement-vote-type.interface';

@Controller('announcement')
@ApiTags('announcement')
@ApiBearerAuth('accessToken')
@HasActiveProfile()
export class AnnouncementController {
  constructor(private readonly announcementService: AnnouncementService) {}

  @Get('')
  async getAnnouncementsByHouseCouncil(
    @Query() params: AnnouncementSearchQueryParams,
    @User() user: UserDocument,
  ) {
    return await this.announcementService.getAnnouncementsByHouseCouncil(
      user.activeProfile['houseCouncil'],
      params,
    );
  }

  @Get('/top')
  async getTopAnnouncements(@User() user: UserDocument) {
    return await this.announcementService.topAnnouncements(user);
  }

  @Get('/:id')
  async getAnnouncement(@Param('id', ValidateMongoId) id: string) {
    return await this.announcementService.findOneAndUpdate({ _id: id }, {});
  }

  @Post('/create')
  async createAnnouncement(
    @Body() createAnnouncementDto: CreateEditAnnouncementDto,
    @User() user: UserDocument,
  ) {
    return await this.announcementService.create(createAnnouncementDto, user);
  }

  @Post('/edit/:id')
  async editAnnouncement(
    @Param('id', ValidateMongoId) id: string,
    @Body() createAnnouncementDto: CreateEditAnnouncementDto,
    @User() user: UserDocument,
  ) {
    return await this.announcementService.edit(id, createAnnouncementDto, user);
  }

  @Delete('/delete/:id')
  async deleteAnnouncement(
    @Param('id', ValidateMongoId) id: string,
    @User() user: UserDocument,
  ) {
    return await this.announcementService.delete(id, user);
  }

  @Post('/vote/:id/type/:type')
  async vote(
    @Param('id', ValidateMongoId) id: string,
    @Param('type', ValidateAnnouncementVoteType) type: AnnouncementVoteType,
    @User() user: UserDocument,
  ) {
    return await this.announcementService.vote(id, type, user);
  }

  @Post('/:id/add-comment')
  async addComment() {}

  @Delete('/delete-comment')
  async deleteComment() {}
}
