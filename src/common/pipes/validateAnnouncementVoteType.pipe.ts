import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';
import { isEnum } from 'class-validator';
import { AnnouncementVoteType } from '../../modules/announcement/interface/announcement-vote-type.interface';

@Injectable()
export class ValidateAnnouncementVoteType
  implements PipeTransform<AnnouncementVoteType>
{
  constructor(private readonly logger: Logger) {}
  transform(value: string, metadata: ArgumentMetadata) {
    if (!isEnum(value, AnnouncementVoteType)) {
      this.logger.error(
        `{message: 'Invalid AnnouncementVoteType value', value: '${value}' }`,
      );
      throw new BadRequestException('Invalid AnnouncementVoteType value');
    }
    return value;
  }
}
