import { Types } from 'mongoose';
import { RolesEnum } from '@decorators/roles.decorator';

export interface ValidateUserPayload {
  _id: Types.ObjectId;
  email?: string;
  role?: RolesEnum;
}
