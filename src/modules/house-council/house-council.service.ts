import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';
import { ChatService } from '../chat/chat.service';
import { HouseCouncilRole } from '../resident-profile/interface/house-council-role.interface';
import { ResidentProfileStatus } from '../resident-profile/interface/resident-profile-status.interface';
import { ResidentProfileService } from '../resident-profile/resident-profile.service';
import { Role } from '../user/interface/role.interface';
import { UserDocument } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { CreateHouseCouncilDto } from './dto/request/createHouseCouncilDto.dto';
import { EditHouseCouncilDto } from './dto/request/editHouseCouncilDto.dto';
import { JoinHouseCouncilDto } from './dto/request/joinHouseCouncilDto.dto';
import { HouseCouncilRepository } from './house-council.repository';
import { HouseCouncilDocument } from './schema/house-council.schema';

@Injectable()
export class HouseCouncilService {
  constructor(
    private readonly houseCouncilRepository: HouseCouncilRepository,
    private readonly residentProfileService: ResidentProfileService,
    private readonly userService: UserService,
    private readonly chatService: ChatService,
  ) {}

  async findOneAndUpdate(
    filter: FilterQuery<HouseCouncilDocument>,
    updateData: UpdateQuery<unknown>,
  ) {
    const houseCouncil = await this.houseCouncilRepository.findOneAndUpdate(
      filter,
      updateData,
    );

    if (!houseCouncil) {
      throw new NotFoundException('House Council Not Found');
    }

    return houseCouncil;
  }

  async create(
    createHouseCouncilDto: CreateHouseCouncilDto,
    user: UserDocument,
  ): Promise<HouseCouncilDocument> {
    // createHouseCouncilDto.apartmentNumber = undefined;
    const houseCouncil = await this.houseCouncilRepository.create(
      createHouseCouncilDto,
    );
    const profile = await this.residentProfileService.create(
      createHouseCouncilDto.apartmentNumber,
      houseCouncil._id,
      user,
      HouseCouncilRole.ADMIN,
      ResidentProfileStatus.APPROVED,
    );

    await this.chatService.createChat(houseCouncil._id);

    return await this.changeAdmin(houseCouncil._id, profile._id);
  }

  async changeAdmin(houseCouncilId: string, residentProfileId: string) {
    return await this.findOneAndUpdate(
      { _id: houseCouncilId },
      {
        admin: residentProfileId,
      },
    );
  }

  async join(joinHouseCouncilDto: JoinHouseCouncilDto, user: UserDocument) {
    const houseCouncil = await this.findOneAndUpdate(
      {
        _id: joinHouseCouncilDto.houseCouncilId,
      },
      {},
    );
    // check already joined
    let profile = undefined;
    try {
      profile = await this.residentProfileService.findOneAndUpdate(
        { houseCouncil: joinHouseCouncilDto.houseCouncilId, user: user._id },
        {},
      );
    } catch (error) {
      profile = await this.residentProfileService.create(
        joinHouseCouncilDto.apartmentNumber,
        houseCouncil._id,
        user,
      );

      return houseCouncil;
    }

    throw new ForbiddenException('You have already joined this house council');
  }

  async edit(
    houseCouncilId: string,
    editHouseCouncilDto: EditHouseCouncilDto,
    user: UserDocument,
  ) {
    await this.checkAccessPermission(houseCouncilId, user);

    return await this.findOneAndUpdate(
      { _id: houseCouncilId },
      editHouseCouncilDto,
    );
  }

  async delete(houseCouncilId: string, user: UserDocument) {
    await this.checkAccessPermission(houseCouncilId, user);

    let status = await this.houseCouncilRepository.deleteMany({
      _id: houseCouncilId,
    });

    if (!status) {
      throw new InternalServerErrorException(
        'Internal Server Error While Deleting House Council',
      );
    }

    const residentProfileIds = (
      await this.residentProfileService.find({
        houseCouncil: houseCouncilId,
      })
    ).map((profile) => profile._id);

    await this.residentProfileService.findAndUpdate(
      {
        houseCouncil: houseCouncilId,
      },
      { status: ResidentProfileStatus.DELETED },
    );

    await this.userService.findAndUpdate(
      {
        profiles: {
          $in: residentProfileIds,
        },
      },
      {
        $pull: {
          profiles: {
            $in: residentProfileIds,
          },
        },
        $unset: {
          activeProfile: undefined,
        },
      },
    );

    return {
      status: true,
    };
  }

  private async checkAccessPermission(
    houseCouncilId: string,
    user: UserDocument,
  ) {
    const houseCouncil = await this.findOneAndUpdate(
      { _id: houseCouncilId },
      {},
    );
    const profile = await this.residentProfileService.findOneAndUpdate(
      {
        _id: user.activeProfile,
        houseCouncil: houseCouncil._id,
        role: HouseCouncilRole.ADMIN,
      },
      {},
    );
    if (user.role !== Role.ADMIN && !profile) {
      throw new ForbiddenException(
        'You Do Not Have Permission To Perform This Action',
      );
    }
  }
}
