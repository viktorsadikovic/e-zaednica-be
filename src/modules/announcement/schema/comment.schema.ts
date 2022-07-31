import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Announcement' })
  announcement: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ResidentProfile' })
  resident: Types.ObjectId;

  @Prop({ type: SchemaTypes.String })
  text: string;

  @Prop({ type: SchemaTypes.ObjectId, default: [] })
  photos: string[];
}
