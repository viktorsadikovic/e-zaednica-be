import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { NotificationType } from '../interface/notification-type.interface';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: SchemaTypes.String })
  type: NotificationType;

  @Prop({ type: SchemaTypes.Boolean, default: false })
  seen: boolean;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'ResidentProfile' })
  profile: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
