import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type HouseCouncilDocument = HouseCouncil & Document;

@Schema({ timestamps: true })
export class HouseCouncil {
  @Prop({ type: SchemaTypes.String })
  street: string;

  @Prop({ type: SchemaTypes.String })
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

export const HouseCouncilSchema = SchemaFactory.createForClass(HouseCouncil);
