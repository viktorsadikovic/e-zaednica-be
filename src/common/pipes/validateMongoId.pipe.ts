import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  Logger,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { isValidObjectId } from 'mongoose';

@Injectable()
export class ValidateMongoId implements PipeTransform<string> {
  constructor(private readonly logger: Logger) {}
  transform(value: string, metadata: ArgumentMetadata) {
    if (isValidObjectId(value)) {
      if (String(new ObjectId(value)) === value) return value;
      this.logger.error(`{message: 'Invalid ID', requestId: '${value}' }`);
      throw new BadRequestException('Invalid ID');
    }
    this.logger.error(`{message: 'Invalid ID', requestId: '${value}' }`);
    throw new BadRequestException('Invalid ID');
  }
}
