import { Types } from 'mongoose';

export interface JwtDecodedUser {
  readonly _id?: Types.ObjectId;

  readonly email: string;

  readonly role: string;

  readonly exp?: number;
}