import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

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

  @Get('/export')
  async exportAmenityItems(
    @Res() res: Response,
    @Query() params: AmenityItemQueryDto,
    @User() user: UserDocument,
  ) {
    const data = await this.amenityItemService.exportAmenityItems(params, user);

    res.header('Content-Type', 'text/csv');
    res.attachment('statements.csv');

    return res.send(data);
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
    @User() user: UserDocument,
  ) {
    return await this.amenityItemService.submitAmenityItem(
      id,
      submitAmenityItemDto,
      user,
    );
  }

  @Post('change-status/:id/:status')
  async changeAmenityItemStatus(
    @Param('id', ValidateMongoId) id: string,
    @Param('status') status: AmenityItemStatus,
  ) {
    return await this.amenityItemService.changeStatus(id, status);
  }
}
