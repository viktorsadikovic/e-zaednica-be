import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { AmenityItemService } from '../amenity-item/amenity-item.service';
import { HouseCouncilRole } from '../resident-profile/interface/house-council-role.interface';
import { ResidentProfileService } from '../resident-profile/resident-profile.service';
import { Role } from '../user/interface/role.interface';
import { UserDocument } from '../user/schema/user.schema';
import { AmenityRepository } from './amenity.repository';
import { CreateEditAmenityDto } from './dto/request/createEditAmenityDto.dto';
import { AmenityQueryParams } from './interface/amenity-query-params.interface';
import { AmenitySortMap } from './interface/amenity-sort-criteria.interface';
import { AmenityStatus } from './interface/amenity-status.interface';
import { AmenityVoteType } from './interface/amenity-vote-type.interface';
import { AmenityDocument } from './schema/amenity.schema';

@Injectable()
export class AmenityService {
  constructor(
    @Inject(forwardRef(() => AmenityItemService))
    private amenityItemService: AmenityItemService,
    private readonly amenityRepository: AmenityRepository,
    private readonly residentProfileService: ResidentProfileService,
  ) {}

  async findOneAndUpdate(
    filter: FilterQuery<AmenityDocument>,
    updateData: UpdateQuery<unknown>,
  ) {
    const amenity = await this.amenityRepository.findOne(filter, {});

    if (!amenity) {
      throw new NotFoundException('Amenity Not Found');
    }

    return await this.amenityRepository.findOneAndUpdate(filter, updateData);
  }

  async find(params: AmenityQueryParams, user: UserDocument) {
    let filters = {};

    for (const key in params) {
      if (key === 'search') {
        const regex = {
          $regex:
            '.*(' +
            params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
            ').*',
          $options: 'i',
        };

        filters = {
          ...filters,
          $or: [
            {
              description: regex,
            },
            {
              title: regex,
            },
          ],
        };
      } else if (key !== 'sort' && key !== 'page') {
        filters[key] = params[key];
      }
    }

    filters = { ...filters, houseCouncil: user.activeProfile['houseCouncil'] };
    return await this.amenityRepository.aggregate([
      {
        $match: filters,
      },
      {
        $sort: AmenitySortMap.get(params.sort),
      },
      {
        $skip: 0 * params.page,
      },
      {
        $limit: 6,
      },
    ]);
  }

  async findAll(
    filter: FilterQuery<AmenityDocument>,
    limit: number = 5,
    sort?: string,
  ) {
    return await this.amenityRepository.find(filter, limit);
  }

  async create(createAmenityDto: CreateEditAmenityDto, user: UserDocument) {
    const amenity = {
      ...createAmenityDto,
      houseCouncil: user.activeProfile['houseCouncil'],
      creator: user.activeProfile._id,
    };

    return await this.amenityRepository.create(amenity);
  }

  async edit(
    filter: FilterQuery<AmenityDocument>,
    updateData: UpdateQuery<unknown>,
    user: UserDocument,
  ) {
    await this.checkAccessPermission(filter._id, user);

    return await this.amenityRepository.updateMany(filter, updateData);
  }

  async delete(id: string, user: UserDocument) {
    await this.checkAccessPermission(id, user);

    return await this.amenityRepository.deleteMany({ _id: id });
  }

  async vote(id: string, amenityVoteType: AmenityVoteType, user: UserDocument) {
    await this.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $pull: {
          votes: {
            profile: user.activeProfile._id,
          },
        },
      },
    );

    let amenity = await this.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          votes: {
            profile: user.activeProfile._id,
            type: amenityVoteType,
          },
        },
      },
    );

    let status = AmenityStatus.PENDING;
    const profilesByHouseCouncil = await this.residentProfileService.find({
      houseCouncil: user.activeProfile['houseCouncil'],
    });
    const numberOfResidents = profilesByHouseCouncil.length;

    if (numberOfResidents === amenity.votes.length) {
      const votesFor = amenity.votes.filter(
        (vote) => vote.type === AmenityVoteType.FOR,
      );
      const votesAgainst = amenity.votes.filter(
        (vote) => vote.type === AmenityVoteType.AGAINST,
      );

      if (votesFor >= votesAgainst) {
        status = AmenityStatus.APPROVED;
      } else {
        status = AmenityStatus.REJECTED;
      }
    }

    amenity = await this.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status: status,
        },
      },
    );

    if (!amenity.recurring && amenity.status === AmenityStatus.APPROVED) {
      // create amenity items with due date
      for (let i = 0; i < profilesByHouseCouncil.length; i++) {
        await this.amenityItemService.createAmenityItemFromAmenity(
          amenity,
          profilesByHouseCouncil[i],
        );
      }
    }

    return amenity;
  }

  async checkAccessPermission(amenityId: string, user: UserDocument) {
    const amenity = await this.amenityRepository.findOne(
      { _id: amenityId },
      {},
    );

    if (
      user.role !== Role.ADMIN &&
      !user.profiles.includes(amenity.creator) &&
      user.activeProfile['houseCouncil'] !== amenity.houseCouncil &&
      user.activeProfile['role'] !== HouseCouncilRole.ADMIN
    ) {
      throw new ForbiddenException(
        'You Do Not Have Permission To Perform This Action',
      );
    }
  }
}
