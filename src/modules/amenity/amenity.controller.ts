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
import { HasActiveProfile } from '../../common/decorators/active-profile.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ValidateMongoId } from '../../common/pipes/validateMongoId.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { AmenityService } from './amenity.service';
import { AmenityVoteQueryDto } from './dto/request/amenityVoteQueryDto.dto';
import { CreateEditAmenityDto } from './dto/request/createEditAmenityDto.dto';
import { AmenityQueryParams } from './interface/amenity-query-params.interface';

@Controller('amenity')
@ApiTags('amenity')
@ApiBearerAuth('accessToken')
@HasActiveProfile()
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  @Get()
  async findAll(
    // @Query() params: AmenityQueryParams,
    @User() user: UserDocument,
  ) {
    return await this.amenityService.findAll({
      houseCouncil: user.activeProfile['houseCouncil'],
    });
  }

  @Get('/find')
  async find(@Query() params: AmenityQueryParams, @User() user: UserDocument) {
    return await this.amenityService.find(params, user);
  }

  @Get('/pending')
  async findPendingAmenities(@User() user: UserDocument) {
    return await this.amenityService.findAll({
      'votes.profile': { $ne: user.activeProfile._id },
      houseCouncil: user.activeProfile['houseCouncil'],
    });
  }

  @Get('/:id')
  async findAmenityById(
    @Param('id', ValidateMongoId) id: string,
    @User() user: UserDocument,
  ) {
    return await this.amenityService.findOneAndUpdate({ _id: id }, {});
  }

  @Get('/by-resident/:id')
  async findAmenitiesByResident(
    // @Query() params: AmenityQueryParams,
    @Param('id', ValidateMongoId) id: string,
    @User() user: UserDocument,
  ) {
    return await this.amenityService.findAll({ resident: id });
  }

  @Post('/create')
  async create(
    @Body() amenityDto: CreateEditAmenityDto,
    @User() user: UserDocument,
  ) {
    return await this.amenityService.create(amenityDto, user);
  }

  @Post('/edit/:id')
  async edit(
    @Param('id', ValidateMongoId) id: string,
    @Body() amenityDto: CreateEditAmenityDto,
    @User() user: UserDocument,
  ) {
    return await this.amenityService.edit({ _id: id }, amenityDto, user);
  }

  @Delete('/delete/:id')
  async delete(
    @Param('id', ValidateMongoId) id: string,
    @User() user: UserDocument,
  ) {
    return await this.amenityService.delete(id, user);
  }

  @Get('/:id/vote')
  async vote(
    @Param('id', ValidateMongoId) id: string,
    @Query() params: AmenityVoteQueryDto,
    @User() user: UserDocument,
  ) {
    return await this.amenityService.vote(id, params.amenityVoteType, user);
  }
}
