import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { AmenityStatus } from '../interface/amenity-status.interface';
import { AmenityVoteType } from '../interface/amenity-vote-type.interface';
import { AmenityVote } from '../interface/amenity-vote.interface';
import { Repeat } from '../interface/repeat.interface';

export type AmenityDocument = Amenity & Document;

@Schema({ timestamps: true })
export class Amenity {
  @Prop({ type: SchemaTypes.String, required: true })
  title: string;

  @Prop({ type: SchemaTypes.String, required: true })
  description: string;

  @Prop({ type: SchemaTypes.Number, required: false })
  amount: number;

  @Prop({ type: SchemaTypes.Boolean, required: true })
  recurring: boolean;

  @Prop({ type: SchemaTypes.String, enum: Repeat, default: undefined })
  repeat: Repeat;

  @Prop({ type: SchemaTypes.Date })
  startDate: Date;

  @Prop({ type: SchemaTypes.Date })
  endDate: Date;

  @Prop({ type: SchemaTypes.Date })
  dueDate: Date;

  @Prop({
    type: SchemaTypes.String,
    default: AmenityStatus.PENDING,
  })
  status: AmenityStatus;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'HouseCouncil' })
  houseCouncil: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ResidentProfile' })
  creator: Types.ObjectId;

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
          enum: AmenityVoteType,
          required: true,
        },
        reason: {
          type: SchemaTypes.String,
          required: false,
        },
      },
    ],
    default: [],
  })
  votes: Array<AmenityVote>;

  // @Prop({ type: SchemaTypes.Array, default: [] })
  // files: string[];
}

export const AmenitySchema = SchemaFactory.createForClass(Amenity);
