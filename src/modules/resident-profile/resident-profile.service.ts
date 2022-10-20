import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { HouseCouncilService } from '../house-council/house-council.service';
import { Role } from '../user/interface/role.interface';
import { UserDocument } from '../user/schema/user.schema';
import { UserService } from '../user/user.service';
import { ChangeResidentProfileStatusDto } from './dto/request/changeResidentProfileStatusDto.dto';
import { EditResidentProfileDto } from './dto/request/editResidentProfileDto.dto';
import { HouseCouncilRole } from './interface/house-council-role.interface';
import { ResidentProfileStatus } from './interface/resident-profile-status.interface';
import { ResidentProfileRepository } from './resident-profile.repository';
import { ResidentProfileDocument } from './schema/resident-profile.schema';

@Injectable()
export class ResidentProfileService {
  constructor(
    private readonly residentProfileRepository: ResidentProfileRepository,
    private readonly userService: UserService,
  ) {}

  async findOneAndUpdate(
    filter: FilterQuery<ResidentProfileDocument>,
    updateData: UpdateQuery<unknown>,
  ) {
    const profile = await this.residentProfileRepository.findOne(filter, {});

    if (!profile) {
      throw new NotFoundException('Resident Profile Not Found');
    }

    return await this.residentProfileRepository.findOneAndUpdate(
      filter,
      updateData,
    );
  }

  async findAndUpdate(
    filter: FilterQuery<ResidentProfileDocument>,
    updateData: UpdateQuery<unknown>,
  ) {
    return await this.residentProfileRepository.updateMany(filter, updateData);
  }

  async find(
    filter: FilterQuery<ResidentProfileDocument>,
    limit?: number,
    sort?: string,
  ) {
    return await this.residentProfileRepository.find(filter);
  }

  async create(
    apartmentNumber: number,
    houseCouncilId: string,
    user: UserDocument,
    role: HouseCouncilRole = HouseCouncilRole.STANDARD_RESIDENT,
    status: ResidentProfileStatus = ResidentProfileStatus.PENDING,
  ) {
    const profile = await this.residentProfileRepository.create({
      apartmentNumber,
      houseCouncil: houseCouncilId,
      user: user._id,
      role,
      status,
    });

    // await this.houseCouncilService.findOneAndUpdate(
    //   { _id: houseCouncilId },
    //   {
    //     $push: {
    //       profiles: profile._id,
    //     },
    //   },
    // );

    await this.userService.findOneAndUpdate(
      { _id: user._id },
      {
        $set: {
          activeProfile: profile._id,
        },
        $push: {
          profiles: profile._id,
        },
      },
    );
    return profile;
  }

  async edit(
    editResidentProfileDto: EditResidentProfileDto,
    user: UserDocument,
  ) {
    // this.checkAccessPermission(user, editResidentProfileDto.residentProfile);

    return await this.residentProfileRepository.findOneAndUpdate(
      { _id: user.activeProfile._id },
      { apartmentNumber: editResidentProfileDto.apartmentNumber },
    );
  }

  async switchProfile(residentProfileId: string, user: UserDocument) {
    await this.findOneAndUpdate({ _id: residentProfileId }, {});
    this.checkAccessPermission(user, residentProfileId);

    user = await this.userService.findOneAndUpdate(
      { _id: user._id },
      { activeProfile: residentProfileId },
    );

    return this.getActiveProfile(user);
  }

  async getMyProfiles(user: UserDocument) {
    return await this.residentProfileRepository.findAndPopulate(
      { user: user._id },
      [{ path: 'houseCouncil' }],
    );
  }

  async changeProfileStatus(
    changeResidentProfileStatusDto: ChangeResidentProfileStatusDto,
    user: UserDocument,
  ) {
    const { profileId, status } = changeResidentProfileStatusDto;
    const profile = await this.findOneAndUpdate({ _id: profileId }, {});

    if (
      user.role !== Role.ADMIN &&
      user.activeProfile['role'] !== HouseCouncilRole.ADMIN &&
      !user.profiles.includes(new Types.ObjectId(profileId))
    ) {
      throw new UnauthorizedException(
        'You do not have permission to this action',
      );
    }
    return await this.findOneAndUpdate({ _id: profileId }, { status });
  }

  async getActiveProfile(user: UserDocument) {
    return await this.residentProfileRepository.findOneAndPopulate(
      {
        _id: user.activeProfile ? user.activeProfile._id : new Types.ObjectId(),
      },
      {},
      [{ path: 'user' }, { path: 'houseCouncil' }],
    );
  }

  async getProfilesByStatus(
    status: ResidentProfileStatus,
    houseCouncil: string,
  ) {
    return await this.residentProfileRepository.findAndPopulate(
      {
        houseCouncil,
        status,
      },
      [{ path: 'user' }],
    );
  }

  private checkAccessPermission(user: UserDocument, residentProfileId: string) {
    if (
      user.role !== Role.ADMIN &&
      !user.profiles.includes(new Types.ObjectId(residentProfileId))
    ) {
      throw new UnauthorizedException(
        'You do not have permission to this action',
      );
    }
  }
}
