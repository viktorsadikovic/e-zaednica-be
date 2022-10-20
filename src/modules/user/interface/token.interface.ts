import { Types } from 'mongoose';

export interface Token {
  token: string;
  createdAt?: Date;
  validUntil?: Date;
}

export interface UsersToken {
  _id: Types.ObjectId;
  tokens: Array<Token>;
}
