import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Types } from 'mongoose';
import { HasActiveProfile } from '../../common/decorators/active-profile.decorator';
import { User } from '../../common/decorators/user.decorator';
import { ValidateMongoId } from '../../common/pipes/validateMongoId.pipe';
import { UserDocument } from '../user/schema/user.schema';
import { AmenityItemService } from './amenity-item.service';
import { SubmitAmenityItemDto } from './dto/request/submit-amenity-item-dto.dto';
import { AmenityItemQueryDto } from './interface/amenity-item-query-dto.dto';
import { AmenityItemStatus } from './interface/amenity-item-status.interface';

@ApiTags('amenity-item')
@ApiBearerAuth('accessToken')
@HasActiveProfile()
@Controller('amenity-item')
export class AmenityItemController {
  constructor(private readonly amenityItemService: AmenityItemService) {}

  @Get('/find')
  async find(@Query() params: AmenityItemQueryDto, @User() user: UserDocument) {
    return await this.amenityItemService.find(params, user);
  }

  @Get('/by-house-council/:id')
  async getAmenityItemsByHouseCouncil(
    @Param('id', ValidateMongoId) id: string,
    // @Query() params: AmenityItemQueryDto,
    @User() user: UserDocument,
  ) {
    return this.amenityItemService.findAll({ 'resident.houseCouncil': id });
  }

  @Get('/by-resident/:id')
  async getAmenityItemsByResident(
    @Param('id', ValidateMongoId) id: string,
    // @Query() params: AmenityItemQueryDto,
    @User() user: UserDocument,
  ) {
    return await this.amenityItemService.findAll({
      resident: new Types.ObjectId(id),
    });
  }

  @Post('submit/:id')
  async submitAmenityItem(
    @Param('id', ValidateMongoId) id: string,
    @Body() submitAmenityItemDto: SubmitAmenityItemDto,
    // @UploadedFile() document: Express.Multer.File,
  ) {
    console.log(submitAmenityItemDto);
    // return await this.amenityItemService.submitAmenityItem(
    //   id,
    //   submitAmenityItemDto,
    // );
  }

  @Post('change-status/:id/:status')
  async changeAmenityItemStatus(
    @Param('id', ValidateMongoId) id: string,
    @Param('status') status: AmenityItemStatus,
  ) {
    return await this.amenityItemService.changeStatus(id, status);
  }
}
