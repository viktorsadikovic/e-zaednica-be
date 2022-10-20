import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { AmenityItemRepository } from './amenity-item.repository';
import { SubmitAmenityItemDto } from './dto/request/submit-amenity-item-dto.dto';
import { AmenityItemStatus } from './interface/amenity-item-status.interface';
import { AmenityItem, AmenityItemDocument } from './schema/amenity-item.schema';
import { Cron } from '@nestjs/schedule';
import { AmenityRepository } from '../amenity/amenity.repository';
import { Repeat } from '../amenity/interface/repeat.interface';
import { ResidentProfileRepository } from '../resident-profile/resident-profile.repository';
import { ResidentProfileStatus } from '../resident-profile/interface/resident-profile-status.interface';
import { AmenityStatus } from '../amenity/interface/amenity-status.interface';
import { AmenityDocument } from '../amenity/schema/amenity.schema';
import { ResidentProfileDocument } from '../resident-profile/schema/resident-profile.schema';
import { AmenityItemQueryDto } from './interface/amenity-item-query-dto.dto';
import { UserDocument } from '../user/schema/user.schema';
import { AmenityItemSortMap } from './interface/amenity-item-sort-criteria.interface';

@Injectable()
export class AmenityItemService {
  constructor(
    private readonly amenityItemRepository: AmenityItemRepository,
    private readonly amenityRepository: AmenityRepository,
    private readonly residentProfileRepository: ResidentProfileRepository,
  ) {}

  // @Cron('0 7 1 * 1', {
  //   timeZone: 'Skopje/Europe',
  // })
  async generateAmenityItemsAutomatically() {
    let amenities = await this.amenityRepository.aggregate([
      {
        $match: {
          recurring: true,
          status: AmenityStatus.APPROVED,
          endDate: { $gte: new Date() },
        },
      },
      {
        $addFields: {
          year: {
            $year: '$endDate',
          },
          month: {
            $month: '$endDate',
          },
        },
      },
    ]);

    for (let i = 0; i < amenities.length; i++) {
      let filter = null;
      // if (amenities[i]['repeat'] === Repeat.EVERY_WEEK) {
      //   filter = {
      //     amenity: amenities[i]['_id'],
      //     recurring: true,
      //     year: amenities[i]['year'],
      //     month: amenities[i]['month'],
      //   };
      // } else
      if (amenities[i]['repeat'] === Repeat.EVERY_MONTH) {
        filter = {
          amenity: amenities[i]['_id'],
          recurring: true,
          month: amenities[i]['month'],
          year: new Date().getFullYear(),
        };
      } else if (amenities[i]['repeat'] === Repeat.EVERY_YEAR) {
        filter = {
          amenity: amenities[i]['_id'],
          recurring: true,
          year: new Date().getFullYear(),
        };
      }

      const amenityItems = await this.amenityItemRepository.aggregate([
        {
          $addFields: {
            year: {
              $year: '$dueDate',
            },
            month: {
              $month: '$dueDate',
            },
          },
        },
        {
          $match: filter,
        },
        {
          $lookup: {
            from: 'residentprofiles',
            localField: 'resident',
            foreignField: '_id',
            as: 'resident',
          },
        },
      ]);

      if (amenityItems.length) {
        const profileIds = amenityItems.map(
          (amenityItem) => amenityItem['resident'][0]['_id'],
        );

        // Find all profiles for that specific house council that doesn't belong to the array above
        const residentProfiles = await this.residentProfileRepository.find({
          _id: { $nin: profileIds },
          houseCouncil: amenityItems[0]['resident']['houseCouncil'],
          status: ResidentProfileStatus.APPROVED,
        });

        // create amenity items
        let newAmenityItems = [];
        for (let j = 0; j < residentProfiles.length; j++) {
          newAmenityItems = [
            ...newAmenityItems,
            {
              amenity: amenities[i]['_id'],
              endDate: amenities[i]['endDate'],
              startDate: amenities[i]['startDate'],
              dueDate: new Date(),
              title: amenities[i]['title'],
              description: amenities[i]['description'],
              amount: amenities[i]['amount'],
              recurring: amenities[i]['recurring'],
              repeat: amenities[i]['repeat'],
              resident: residentProfiles[j]['_id'],
            },
          ];
        }
        await this.amenityItemRepository.insertMany(newAmenityItems);
      } else {
        const residentProfiles = await this.residentProfileRepository.find({
          houseCouncil: amenities[i]['houseCouncil'],
          status: ResidentProfileStatus.APPROVED,
        });

        // create amenity items
        let newAmenityItems = [];
        for (let j = 0; j < residentProfiles.length; j++) {
          newAmenityItems = [
            ...newAmenityItems,
            {
              amenity: amenities[i]['_id'],
              endDate: amenities[i]['endDate'],
              startDate: amenities[i]['startDate'],
              dueDate: new Date(),
              title: amenities[i]['title'],
              description: amenities[i]['description'],
              amount: amenities[i]['amount'],
              recurring: amenities[i]['recurring'],
              repeat: amenities[i]['repeat'],
              resident: residentProfiles[j]['_id'],
            },
          ];
        }
        await this.amenityItemRepository.insertMany(newAmenityItems);
      }
    }
  }

  async findOneAndUpdate(
    filter: FilterQuery<AmenityItemDocument>,
    updateData: UpdateQuery<unknown>,
  ) {
    const amenityitem = await this.amenityItemRepository.findOne(filter, {});

    if (!amenityitem) {
      throw new NotFoundException('AmenityItem Not Found');
    }

    return await this.amenityItemRepository.findOneAndUpdate(
      filter,
      updateData,
    );
  }

  async find(params: AmenityItemQueryDto, user: UserDocument) {
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
      } else if (key === 'resident') {
        filters['resident._id'] = new Types.ObjectId(params[key]);
      } else if (key !== 'sort' && key !== 'page') {
        filters[key] = params[key];
      }
    }
    filters = {
      ...filters,
      'resident.houseCouncil': user.activeProfile['houseCouncil'],
    };

    return await this.amenityItemRepository.aggregate([
      {
        $lookup: {
          from: 'residentprofiles',
          localField: 'resident',
          foreignField: '_id',
          as: 'resident',
        },
      },
      {
        $match: filters,
      },
      {
        $sort: AmenityItemSortMap.get(params.sort),
      },
      {
        $skip: params.page * 5,
      },
      {
        $limit: 5,
      },
      {
        $project: {
          resident: 0,
        },
      },
    ]);
  }

  async findAll(
    filter: FilterQuery<AmenityItemDocument>,
    limit: number = 5,
    sort: Record<string, 1 | -1> = { createdAt: -1 },
  ) {
    return await this.amenityItemRepository.aggregate([
      {
        $match: filter,
      },
      {
        $sort: sort,
      },
      {
        $limit: limit,
      },
    ]);
  }

  async createAmenityItemFromAmenity(
    amenity: AmenityDocument,
    residentProfile: ResidentProfileDocument,
  ) {
    let amenityItem: AmenityItem = {
      amenity: amenity._id,
      endDate: amenity.endDate,
      startDate: amenity.startDate,
      dueDate: amenity.dueDate,
      title: amenity.title,
      description: amenity.description,
      amount: amenity.amount,
      recurring: amenity.recurring,
      repeat: amenity.repeat,
      resident: residentProfile._id,
      status: AmenityItemStatus.PENDING,
      document: undefined,
      note: undefined,
    };

    if (!amenity.recurring) {
      amenityItem = {
        ...amenityItem,
        startDate: undefined,
        endDate: undefined,
        repeat: undefined,
      };
    }

    return await this.amenityItemRepository.create(amenityItem);
  }

  async submitAmenityItem(
    _id: string,
    submitAmenityItemDto: SubmitAmenityItemDto,
  ) {
    return this.findOneAndUpdate(
      { _id },
      { ...submitAmenityItemDto, status: AmenityItemStatus.UNDER_REVIEW },
    );
  }

  async changeStatus(_id: string, status: AmenityItemStatus) {
    return await this.findOneAndUpdate({ _id }, { status });
  }
}
