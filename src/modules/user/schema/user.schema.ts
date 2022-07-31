import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Role } from '../interface/role.interface';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: SchemaTypes.String })
  firstName: string;

  @Prop({ type: SchemaTypes.String })
  lastName: string;

  @Prop({ type: SchemaTypes.String })
  role: Role;

  @Prop({ type: SchemaTypes.String })
  photo?: string;

  @Prop({ type: SchemaTypes.String })
  phone: string;

  @Prop({ type: SchemaTypes.String })
  profileImage: string;

  @Prop({ type: SchemaTypes.String })
  profileImageLocation: string;

  @Prop({ type: SchemaTypes.String, index: { unique: true, sparse: true } })
  email: string;

  @Prop({ type: SchemaTypes.String })
  password: string;

  @Prop({
    type: [{ type: SchemaTypes.ObjectId, ref: 'ResidentProfile' }],
    default: [],
  })
  profiles: Array<Types.ObjectId>;
}

export const UserSchema = SchemaFactory.createForClass(User);
