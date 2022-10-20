import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { AnnouncementVoteType } from '../interface/announcement-vote-type.interface';
import { AnnouncementVote } from '../interface/announcement-vote.interface';

export type AnnouncementDocument = Announcement & Document;

@Schema({ timestamps: true })
export class Announcement {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'HouseCouncil' })
  houseCouncil: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ResidentProfile' })
  resident: Types.ObjectId;

  @Prop({ type: SchemaTypes.String })
  title: string;

  @Prop({ type: SchemaTypes.String })
  description: string;

  @Prop({ type: SchemaTypes.Array, default: [] })
  photos: String[];

  @Prop({
    type: [
      {
        _id: false,
        profile: {
          type: SchemaTypes.ObjectId,
          required: true,
          ref: 'ResidentProfile',
        },
        type: {
          type: SchemaTypes.String,
          enum: AnnouncementVoteType,
          required: true,
        },
      },
    ],
    default: [],
  })
  votes: Array<AnnouncementVote>;
}

export const AnnouncementSchema = SchemaFactory.createForClass(Announcement);
