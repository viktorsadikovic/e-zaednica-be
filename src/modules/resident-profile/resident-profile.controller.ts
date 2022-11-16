import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { User } from '../../common/decorators/user.decorator';
import { ValidateMongoId } from '../../common/pipes/validateMongoId.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { ChangeResidentProfileStatusDto } from './dto/request/changeResidentProfileStatusDto.dto';
import { EditResidentProfileDto } from './dto/request/editResidentProfileDto.dto';
import { ResidentProfileStatus } from './interface/resident-profile-status.interface';
import { ResidentProfileService } from './resident-profile.service';

@Controller('resident-profile')
@ApiTags('resident-profile')
@ApiBearerAuth('accessToken')
export class ResidentProfileController {
  constructor(
    private readonly residentProfileService: ResidentProfileService,
  ) {}

  @Get('')
  async getMyProfiles(@User() user: UserDocument) {
    return await this.residentProfileService.getMyProfiles(user);
  }

  @Get('/by-house-council')
  async getResidentsByHouseCouncil(@User() user: UserDocument) {
    return await this.residentProfileService.getResidentsByHouseCouncil(
      user.activeProfile['houseCouncil'],
    );
  }

  @Post('/edit')
  async edit(
    @Body() editResidentProfileDto: EditResidentProfileDto,
    @User() user: UserDocument,
  ) {
    return await this.residentProfileService.edit(editResidentProfileDto, user);
  }

  @Post('/switch-profile/:id')
  async switchProfile(
    @Param('id', ValidateMongoId) residentProfileId: string,
    @User() user: UserDocument,
  ) {
    return await this.residentProfileService.switchProfile(
      residentProfileId,
      user,
    );
  }

  @Get('/:status/status')
  async getProfilesByStatus(
    @Param('status') status: ResidentProfileStatus,
    @User() user: UserDocument,
  ) {
    return await this.residentProfileService.getProfilesByStatus(
      status,
      user.activeProfile['houseCouncil'],
    );
  }

  @Post('/change-profile-status')
  async changeProfileStatus(
    @Body() changeResidentProfileStatusDto: ChangeResidentProfileStatusDto,
    @User() user: UserDocument,
  ) {
    return await this.residentProfileService.changeProfileStatus(
      changeResidentProfileStatusDto,
      user,
    );
  }

  @Get('/active')
  async getActiveProfile(@User() user: UserDocument) {
    return await this.residentProfileService.getActiveProfile(user);
  }

  @Get('/export')
  async exportResidents(@Res() res: Response, @User() user: UserDocument) {
    const data = await this.residentProfileService.exportResidents(user);

    res.header('Content-Type', 'text/csv');
    res.attachment('statements.csv');

    return res.send(data);
  }
}
