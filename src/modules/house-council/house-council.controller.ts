import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../../common/decorators/user.decorator';
import { ValidateMongoId } from '../../common/pipes/validateMongoId.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { CreateHouseCouncilDto } from './dto/request/createHouseCouncilDto.dto';
import { EditHouseCouncilDto } from './dto/request/editHouseCouncilDto.dto';
import { InvitePeopleDto } from './dto/request/invitePeopleDto.dto';
import { JoinHouseCouncilDto } from './dto/request/joinHouseCouncilDto.dto';
import { HouseCouncilService } from './house-council.service';
import { MailerService } from '@nestjs-modules/mailer';
import { RequestAdminChangeDto } from './dto/request/requestAdminChangeDto.dto';
import { AmenityVoteQueryDto } from '../amenity/dto/request/amenityVoteQueryDto.dto';
import { SubmitAdminChangeVoteDto } from './dto/request/submitAdminChangeVoteDto.dto';

@Controller('house-council')
@ApiTags('house-council')
@ApiBearerAuth('accessToken')
export class HouseCouncilController {
  constructor(
    private readonly houseCouncilService: HouseCouncilService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('/create')
  async createHouseCouncil(
    @Body() createHouseCouncilDto: CreateHouseCouncilDto,
    @User() user: UserDocument,
  ) {
    return await this.houseCouncilService.create(createHouseCouncilDto, user);
  }

  @Get('/:id')
  async getHouseCouncil(@Param('id', ValidateMongoId) id: string) {
    return await this.houseCouncilService.findOneAndUpdate({ _id: id }, {});
  }

  @Post('/join')
  async joinHouseCouncil(
    @Body() joinHouseCouncilDto: JoinHouseCouncilDto,
    @User() user: UserDocument,
  ) {
    return await this.houseCouncilService.join(joinHouseCouncilDto, user);
  }

  @Post('/invite')
  async invitePeople(
    @Body() invitePeople: InvitePeopleDto,
    @User() user: UserDocument,
  ) {
    console.log(invitePeople.email, user.activeProfile['houseCouncil']);
    // await this.mailerService.sendMail({
    //   to: invitePeople.email, // list of receivers
    //   from: 'noreply@nestjs.com', // sender address
    //   subject: 'Join Our House Council', // Subject line
    //   text: 'Hi', // plaintext body
    // });
    return null;
  }

  @Post('/edit/:id')
  async edit(
    @Param('id', ValidateMongoId) houseCouncilId: string,
    @Body() editHouseCouncilDto: EditHouseCouncilDto,
    @User() user: UserDocument,
  ) {
    return await this.houseCouncilService.edit(
      houseCouncilId,
      editHouseCouncilDto,
      user,
    );
  }

  @Delete('/delete/:id')
  async delete(
    @Param('id', ValidateMongoId) houseCouncilId: string,
    @User() user: UserDocument,
  ) {
    return await this.houseCouncilService.delete(houseCouncilId, user);
  }

  @Get('/admin-change-requests/all')
  async getAdminChangeRequests(@User() user: UserDocument) {
    return await this.houseCouncilService.getAdminChangeRequests(user);
  }

  @Post('/request-admin-change')
  async requestAdminChange(
    @Body() requestAdminChangeDto: RequestAdminChangeDto,
    @User() user: UserDocument,
  ) {
    return await this.houseCouncilService.requestAdminChange(
      requestAdminChangeDto,
      user.activeProfile['houseCouncil'],
      user,
    );
  }

  @Post('/submit-admin-change/:id')
  async submitAdminChangeVote(
    @Param('id', ValidateMongoId) adminRequestId: string,
    @Body() submitAdminChangeVote: SubmitAdminChangeVoteDto,
    @User() user: UserDocument,
  ) {
    return await this.houseCouncilService.submitAdminChangeVote(
      adminRequestId,
      submitAdminChangeVote.residentId,
      user,
    );
  }
}
