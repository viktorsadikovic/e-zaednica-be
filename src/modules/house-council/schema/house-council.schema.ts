import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class HouseCouncil {
  @Prop({ type: SchemaTypes.String })
  street: string;

  @Prop({ type: SchemaTypes.Number })
  number: number;

  @Prop({ type: SchemaTypes.String })
  city: string;

  @Prop({ type: SchemaTypes.String })
  country: string;

  @Prop({ type: SchemaTypes.Number })
  zipcode: number;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ResidentProfile' })
  admin: Types.ObjectId;
}
