import { Types } from 'mongoose';
import { AmenityVoteType } from './amenity-vote-type.interface';

export interface AmenityVote {
  profile: Types.ObjectId;
  type: AmenityVoteType;
  reason: string;
}
