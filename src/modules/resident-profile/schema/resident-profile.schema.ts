import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { HouseCouncilRole } from '../interface/house-council-role.interface';
import { ResidentProfileStatus } from '../interface/resident-profile-status.interface';

export type ResidentProfileDocument = ResidentProfile & Document;

@Schema({ timestamps: true })
export class ResidentProfile {
  @Prop({ type: SchemaTypes.Number })
  apartmentNumber: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'HouseCouncil' })
  houseCouncil: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: SchemaTypes.String, default: HouseCouncilRole.STANDARD_RESIDENT })
  role: HouseCouncilRole;

  @Prop({ type: SchemaTypes.String, default: ResidentProfileStatus.PENDING })
  status: ResidentProfileStatus;
}

export const ResidentProfileSchema =
  SchemaFactory.createForClass(ResidentProfile);
