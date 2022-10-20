import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

export type CommentDocument = Comment & Document;

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Announcement' })
  announcement: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ResidentProfile' })
  resident: Types.ObjectId;

  @Prop({ type: SchemaTypes.String })
  text: string;

  @Prop({ type: SchemaTypes.Array, default: [] })
  files: string[];
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
