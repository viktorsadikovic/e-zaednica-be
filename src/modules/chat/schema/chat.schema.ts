import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'HouseCouncil' })
  houseCouncil: Types.ObjectId;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
