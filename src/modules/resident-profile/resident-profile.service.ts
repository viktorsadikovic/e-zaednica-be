import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FilterQuery, ObjectId, Types, UpdateQuery } from 'mongoose';
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
import { Parser } from 'json2csv';

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

  async getResidentsByHouseCouncil(houseCouncilId: string) {
    return await this.residentProfileRepository.findAndPopulate(
      {
        houseCouncil: houseCouncilId,
      },
      [
        {
          path: 'user',
        },
      ],
    );
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

  async exportResidents(user: UserDocument) {
    const fields = [
      'firstName',
      'lastName',
      'email',
      'phone',
      'apartmentNumber',
      'street',
      'number',
      'city',
      'zipcode',
      'country',
      'role',
      'status',
    ];
    const data = await this.residentProfileRepository.aggregate([
      {
        $match: {
          houseCouncil: user.activeProfile['houseCouncil'],
        },
      },
      {
        $lookup: {
          from: 'housecouncils',
          localField: 'houseCouncil',
          foreignField: '_id',
          as: 'houseCouncil',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $project: {
          firstName: {
            $arrayElemAt: ['$user.firstName', 0],
          },
          lastName: {
            $arrayElemAt: ['$user.lastName', 0],
          },
          email: {
            $arrayElemAt: ['$user.email', 0],
          },
          phone: {
            $arrayElemAt: ['$user.phone', 0],
          },
          apartmentNumber: 1,
          street: {
            $arrayElemAt: ['$houseCouncil.street', 0],
          },
          number: {
            $arrayElemAt: ['$houseCouncil.number', 0],
          },
          city: {
            $arrayElemAt: ['$houseCouncil.city', 0],
          },
          zipcode: {
            $arrayElemAt: ['$houseCouncil.zipcode', 0],
          },
          country: {
            $arrayElemAt: ['$houseCouncil.country', 0],
          },
          role: 1,
          status: 1,
        },
      },
    ]);

    const opts = { fields };
    const parser = new Parser(opts);

    try {
      const csv = parser.parse(data);

      return csv;
    } catch (error) {
      throw new InternalServerErrorException(
        'Internal server error while exporting data. Please try again later.',
      );
    }
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
