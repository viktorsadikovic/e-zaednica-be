import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { Role } from '../user/interface/role.interface';
import { UserDocument } from '../user/schema/user.schema';
import { AnnouncementRepository } from './announcement.repository';
import { CreateEditAnnouncementDto } from './dto/request/createEditAnnouncementDto.dto';
import { AnnouncementSearchQueryParams } from './interface/announcement-search-query-param.dto';
import { AnnouncementSortMap } from './interface/announcement-sort-criteria.interface';
import { AnnouncementVoteType } from './interface/announcement-vote-type.interface';
import { AnnouncementDocument } from './schema/announcement.schema';

@Injectable()
export class AnnouncementService {
  constructor(
    private readonly announcementRepository: AnnouncementRepository,
  ) {}

  async findOneAndUpdate(
    filter: FilterQuery<AnnouncementDocument>,
    updateData: UpdateQuery<unknown>,
  ) {
    const announcement = await this.announcementRepository.findOne(filter, {});

    if (!announcement) {
      throw new NotFoundException('Announcement Not Found');
    }

    return await this.announcementRepository.findOneAndUpdate(
      filter,
      updateData,
    );
  }

  async findAndUpdate(
    filter: FilterQuery<AnnouncementDocument>,
    updateData: UpdateQuery<unknown>,
  ) {
    return await this.announcementRepository.updateMany(filter, updateData);
  }

  async getAnnouncementsByHouseCouncil(
    houseCouncilId: string,
    params: AnnouncementSearchQueryParams,
  ) {
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
            {
              'user.firstName': regex,
            },
            {
              'user.lastName': regex,
            },
          ],
        };
      } else {
        filters = {
          ...filters,
        };
      }
    }

    filters = { ...filters, houseCouncil: houseCouncilId };

    return await this.announcementRepository.aggregate([
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
        },
      },
      {
        $match: filters,
      },
      {
        $sort: AnnouncementSortMap.get(params.sort),
      },
      {
        $skip: params.page * 2,
      },
      {
        $limit: 5,
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          houseCouncil: 1,
          votes: 1,
          createdAt: 1,
          resident: {
            $first: {
              $map: {
                input: '$resident',
                as: 'resident',
                in: {
                  _id: '$$resident._id',
                },
              },
            },
          },
          user: {
            $first: {
              $map: {
                input: '$user',
                as: 'user',
                in: {
                  _id: '$$user._id',
                  firstName: '$$user.firstName',
                  lastName: '$$user.lastName',
                  email: '$$user.email',
                },
              },
            },
          },
        },
      },
    ]);
  }

  async create(
    createAnnouncementDto: CreateEditAnnouncementDto,
    user: UserDocument,
  ) {
    const announcement = {
      ...createAnnouncementDto,
      resident: user.activeProfile._id,
      houseCouncil: user.activeProfile['houseCouncil'],
    };
    return await this.announcementRepository.create(announcement);
  }

  async edit(
    id: string,
    editAnnouncementDto: CreateEditAnnouncementDto,
    user: UserDocument,
  ) {
    await this.checkAccessPermissions(user, id);
    return await this.findOneAndUpdate({ _id: id }, editAnnouncementDto);
  }
  async delete(id: string, user: UserDocument) {
    await this.checkAccessPermissions(user, id);

    return this.announcementRepository.deleteMany({ _id: id });
  }

  async vote(id: string, type: AnnouncementVoteType, user: UserDocument) {
    const announcement = await this.findOneAndUpdate({ _id: id }, {});
    const index = announcement.votes
      .map((vote) => vote.profile.toString())
      .indexOf(user.activeProfile._id.toString());

    if (index > -1) {
      if (announcement.votes[index].type === type) {
        return await this.findOneAndUpdate(
          { _id: id },
          {
            $pull: { votes: { profile: user.activeProfile._id } },
          },
        );
      } else {
        await this.findOneAndUpdate(
          { _id: id },
          {
            $pull: { votes: { profile: user.activeProfile._id } },
          },
        );

        return this.findOneAndUpdate(
          { _id: id },
          {
            $push: {
              votes: {
                profile: user.activeProfile._id,
                type: type,
              },
            },
          },
        );
      }
    } else {
      return await this.findOneAndUpdate(
        { _id: id },
        {
          $push: {
            votes: {
              profile: user.activeProfile._id,
              type: type,
            },
          },
        },
      );
    }
  }

  async topAnnouncements(user: UserDocument) {
    return await this.announcementRepository.aggregate([
      {
        $match: {
          houseCouncil: user.activeProfile['houseCouncil'],
        },
      },
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
        },
      },
      {
        $project: {
          _id: 1,
          houseCouncil: 1,
          resident: {
            $first: '$resident',
          },
          title: 1,
          description: 1,
          photos: 1,
          votes: 1,
          createdAt: 1,
          user: {
            $first: '$user',
          },
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $limit: 3,
      },
    ]);
  }

  private async checkAccessPermissions(
    user: UserDocument,
    announcementId: string,
  ) {
    const announcement = await this.findOneAndUpdate(
      { _id: announcementId },
      {},
    );
    if (
      user.role !== Role.ADMIN &&
      !user.profiles.includes(announcement.resident)
    ) {
      throw new UnauthorizedException(
        'You Do Not Have Permission To This Action',
      );
    }
  }
}
