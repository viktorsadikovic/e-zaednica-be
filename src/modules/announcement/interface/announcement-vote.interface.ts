import { AnnouncementVoteType } from './announcement-vote-type.interface';

export interface AnnouncementVote {
  profile: string;
  type: AnnouncementVoteType;
}
