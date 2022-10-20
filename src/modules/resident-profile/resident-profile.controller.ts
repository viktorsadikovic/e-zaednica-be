import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
}
