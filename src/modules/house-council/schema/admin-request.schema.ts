import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { AmenityStatus } from '../../amenity/interface/amenity-status.interface';
import { AmenityVoteType } from '../../amenity/interface/amenity-vote-type.interface';
import { AmenityVote } from '../../amenity/interface/amenity-vote.interface';

export type AdminRequestDocument = AdminRequest & Document;

@Schema({ timestamps: true })
export class AdminRequest {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'HouseCouncil' })
  houseCouncil: Types.ObjectId;

  @Prop({
    type: [
      {
        _id: false,
        voter: {
          type: SchemaTypes.ObjectId,
          required: true,
          ref: 'ResidentProfile',
        },
        resident: {
          type: SchemaTypes.ObjectId,
          required: true,
          ref: 'ResidentProfile',
        },
      },
    ],
    default: [],
  })
  votes: Array<any>;

  @Prop({
    type: SchemaTypes.String,
    default: AmenityStatus.PENDING,
  })
  status: AmenityStatus;
}

export const AdminRequestSchema = SchemaFactory.createForClass(AdminRequest);
