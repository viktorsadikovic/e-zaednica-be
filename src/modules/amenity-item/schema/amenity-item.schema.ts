import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Repeat } from '../../amenity/interface/repeat.interface';
import { AmenityItemStatus } from '../interface/amenity-item-status.interface';

export type AmenityItemDocument = AmenityItem & Document;

@Schema({ timestamps: true })
export class AmenityItem {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Amenity' })
  amenity: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ResidentProfile' })
  resident: Types.ObjectId;

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
  dueDate: Date;

  @Prop({ type: SchemaTypes.Date })
  endDate: Date;

  @Prop({
    type: SchemaTypes.String,
    enum: AmenityItemStatus,
    default: AmenityItemStatus.PENDING,
  })
  status: AmenityItemStatus;

  // DOCUMENT
  @Prop({ type: SchemaTypes.String })
  document: string;

  @Prop({ type: SchemaTypes.String, required: false })
  note: string;
}

export const AmenityItemSchema = SchemaFactory.createForClass(AmenityItem);
