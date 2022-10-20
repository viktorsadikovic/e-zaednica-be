import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Chat' })
  chat: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ResidentProfile' })
  resident: Types.ObjectId;

  @Prop({ type: SchemaTypes.String })
  text: string;
  // files: string[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
