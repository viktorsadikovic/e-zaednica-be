import {
  Body,
  Controller,
  Delete,
  Get,
  Param, Post
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from '../../common/decorators/user.decorator';
import { ValidateMongoId } from '../../common/pipes/validateMongoId.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { CreateHouseCouncilDto } from './dto/request/createHouseCouncilDto.dto';
import { EditHouseCouncilDto } from './dto/request/editHouseCouncilDto.dto';
import { JoinHouseCouncilDto } from './dto/request/joinHouseCouncilDto.dto';
import { HouseCouncilService } from './house-council.service';

@Controller('house-council')
@ApiTags('house-council')
@ApiBearerAuth('accessToken')
export class HouseCouncilController {
  constructor(private readonly houseCouncilService: HouseCouncilService) {}

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
}
