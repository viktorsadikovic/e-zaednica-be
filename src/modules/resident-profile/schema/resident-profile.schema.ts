import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { HouseCouncilRole } from '../interface/house-council-role.interface';
import { ResidentProfileStatus } from '../interface/resident-profile-status.interface';

@Schema({ timestamps: true })
export class ResidentProfile {
  @Prop({ type: SchemaTypes.Number })
  apartmentNumber: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'HouseCouncil' })
  houseCouncil: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: HouseCouncilRole, default: HouseCouncilRole.STANDARD_RESIDENT })
  role: HouseCouncilRole;

  @Prop({ type: ResidentProfileStatus, default: ResidentProfileStatus.PENDING })
  status: ResidentProfileStatus;
}
