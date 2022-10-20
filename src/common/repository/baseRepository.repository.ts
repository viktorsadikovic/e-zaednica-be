import {
  AnyKeys,
  Document,
  FilterQuery,
  InsertManyOptions,
  Model,
  PipelineStage,
  PopulateOptions,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import mongodb = require('mongodb');
import { InternalServerErrorException, Logger } from '@nestjs/common';

export abstract class BaseRepository<T extends Document> {
  constructor(protected readonly entityModel: Model<T>) {}

  async findOne(
    filter: FilterQuery<T>,
    projection: Record<string, unknown>,
  ): Promise<T | null> {
    return this.entityModel
      .findOne(filter, {
        _v: 0,
        __v: 0,
        ...projection,
      })
      .exec()
      .catch((err) => {
        Logger.error(err);
        throw new InternalServerErrorException(err);
      });
  }

  async find(
    filter?: FilterQuery<T>,
    limit?: number,
    sort?: string,
  ): Promise<T[] | null> {
    return limit
      ? this.entityModel
          .find(filter)
          .sort(sort)
          .limit(limit)
          .exec()
          .catch((err) => {
            Logger.error(err);
            throw new InternalServerErrorException(err);
          })
      : this.entityModel
          .find(filter)
          .sort(sort)
          .exec()
          .catch((err) => {
            Logger.error(err);
            throw new InternalServerErrorException(err);
          });
  }

  async aggregate<U>(pipeline: PipelineStage[]): Promise<U[] | null> {
    return this.entityModel.aggregate(pipeline).catch((err) => {
      Logger.error(err);
      throw new InternalServerErrorException(err);
    });
  }

  async findOneAndPopulate<U>(
    filter: FilterQuery<T>,
    projection: Record<string, unknown>,
    paths: Array<PopulateOptions>,
  ): Promise<U | null> {
    return this.entityModel
      .findOne(filter, {
        _v: 0,
        __v: 0,
        ...projection,
      })
      .populate<any>(paths)
      .exec()
      .catch((err) => {
        Logger.error(err);
        throw new InternalServerErrorException(err);
      });
  }

  async findAndPopulate<U>(
    filter: FilterQuery<T>,
    paths: Array<PopulateOptions>,
    projection?: Record<string, unknown>,
  ): Promise<U[] | null> {
    return this.entityModel
      .find(filter, { _v: 0, __v: 0, ...projection })
      .populate<any>(paths)
      .sort({ createdAt: 'desc' })
      .catch((err) => {
        Logger.error(err);
        throw new InternalServerErrorException(err);
      });
  }

  async create(data: AnyKeys<T>): Promise<T> {
    const entity = new this.entityModel(data);
    return entity.save().catch((err) => {
      Logger.error(err);
      throw new InternalServerErrorException(err);
    });
  }

  async bulkWrite(insertStatements: any[]): Promise<mongodb.BulkWriteResult> {
    return this.entityModel.bulkWrite(insertStatements).catch((err) => {
      Logger.error(err);
      throw new InternalServerErrorException(err);
    });
  }

  async updateMany(
    filter: FilterQuery<T>,
    update: UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<mongodb.UpdateResult> {
    return this.entityModel.updateMany(filter, update, options).catch((err) => {
      Logger.error(err);
      throw new InternalServerErrorException(err);
    });
  }

  async findOneAndUpdate(
    filter: FilterQuery<T>,
    updateData: UpdateQuery<unknown>,
  ): Promise<T | null> {
    return this.entityModel
      .findOneAndUpdate(filter, updateData, {
        new: true,
      })
      .catch((err) => {
        Logger.error(err);
        throw new InternalServerErrorException(err);
      });
  }

  async deleteMany(filter: FilterQuery<T>): Promise<boolean> {
    const deleteResult = await this.entityModel
      .deleteMany(filter)
      .catch((err) => {
        Logger.error(err);
        throw new InternalServerErrorException(err);
      });
    return deleteResult.deletedCount >= 1;
  }

  async insertMany(
    data: AnyKeys<T>[],
    options?: InsertManyOptions,
  ): Promise<any[]> {
    return await this.entityModel.insertMany(data, options).catch((err) => {
      Logger.error(err);
      throw new InternalServerErrorException(err);
    });
  }

  async count(filter?: FilterQuery<T>): Promise<Number | null> {
    const res = await this.entityModel.find(filter).catch((err) => {
      Logger.error(err);
      throw new InternalServerErrorException(err);
    });
    return res.length;
  }
}
