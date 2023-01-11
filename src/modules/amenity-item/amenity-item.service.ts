import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Parser } from 'json2csv';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { AmenityRepository } from '../amenity/amenity.repository';
import { AmenityStatus } from '../amenity/interface/amenity-status.interface';
import { Repeat } from '../amenity/interface/repeat.interface';
import { AmenityDocument } from '../amenity/schema/amenity.schema';
import { HouseCouncilRole } from '../resident-profile/interface/house-council-role.interface';
import { ResidentProfileStatus } from '../resident-profile/interface/resident-profile-status.interface';
import { ResidentProfileRepository } from '../resident-profile/resident-profile.repository';
import { ResidentProfileDocument } from '../resident-profile/schema/resident-profile.schema';
import { UserDocument } from '../user/schema/user.schema';
import { AmenityItemRepository } from './amenity-item.repository';
import { SubmitAmenityItemDto } from './dto/request/submit-amenity-item-dto.dto';
import { AmenityItemQueryDto } from './interface/amenity-item-query-dto.dto';
import { AmenityItemSortMap } from './interface/amenity-item-sort-criteria.interface';
import { AmenityItemStatus } from './interface/amenity-item-status.interface';
import { AmenityItem, AmenityItemDocument } from './schema/amenity-item.schema';

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
        $lookup: {
          from: 'users',
          localField: 'resident.user',
          foreignField: '_id',
          as: 'user',
        }
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
      }
    ]);
  }

  async exportAmenityItems(params: AmenityItemQueryDto, user: UserDocument) {
    const fields = [
      'title',
      'description',
      'amount',
      'dueDate',
      'recurring',
      'status',
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
    ];
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
      }
    }
    filters = {
      ...filters,
      'resident.houseCouncil': user.activeProfile['houseCouncil'],
    };

    const data = await this.amenityItemRepository.aggregate([
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
        $lookup: {
          from: 'users',
          localField: 'resident.user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'amenities',
          localField: 'amenity',
          foreignField: '_id',
          as: 'amenity',
        },
      },
      {
        $lookup: {
          from: 'housecouncils',
          localField: 'amenity.houseCouncil',
          foreignField: '_id',
          as: 'houseCouncil',
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          amount: 1,
          dueDate: 1,
          recurring: 1,
          status: 1,
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
          apartmentNumber: {
            $arrayElemAt: ['$resident.apartmentNumber', 0],
          },
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
          role: {
            $arrayElemAt: ['$resident.role', 0],
          },
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
    user: UserDocument,
  ) {
    let status = AmenityItemStatus.UNDER_REVIEW;
    if (user.activeProfile['role'] === HouseCouncilRole.ADMIN) {
      status = AmenityItemStatus.ACCEPTED;
    }
    return this.findOneAndUpdate({ _id }, { ...submitAmenityItemDto, status });
  }

  async changeStatus(_id: string, status: AmenityItemStatus) {
    return await this.findOneAndUpdate({ _id }, { status });
  }
}
