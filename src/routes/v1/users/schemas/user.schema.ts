import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { OtpUserDto } from '../dto/otp-user.dto';
import { AddressUserDto } from '../dto/address-user.dt0';
import { RolesEnum } from '@decorators/roles.decorator';
import { ExchangeUserDto } from '../dto/exchange-user-dto';
@Schema()
export class User {
  @Prop({
    required: true,
    index: true,
    type: String,
  })
  authId: string;

  @Prop({
    required: true,
    type: String,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    type: String,
  })
  email: string;

  @Prop({
    required: false,
    type: String,
  })
  password?: string;

  @Prop({
    required: true,
    unique: true,
    type: String,
  })
  mobileNo: string;

  @Prop({
    required: false,
    type: String,
  })
  passwordResetTime?: string;

  @Prop({
    required: false,
    type: OtpUserDto,
  })
  otp?: OtpUserDto;

  @Prop({
    required: false,
    type: String,
  })
  refreshToken?: string = null;

  @Prop({
    required: false,
    type: String,
  })
  refreshTokenCreationTime?: string = null;

  @Prop({
    required: false,
    type: AddressUserDto,
  })
  address?: AddressUserDto;

  @Prop({
    // required: true,
    type: Boolean,
    default: false,
  })
  verified?: boolean;

  @Prop({
    type: String,
    required: false,
    default: RolesEnum.USER,
  })
  role: RolesEnum;

  // @Prop({
  //   type: [],
  //   required: false,
  //   default: null
  // })
  // exchange?: ExchangeUserDto[]

  @Prop({
    type: Boolean,
    required: false,
  })
  whatsappUpdate?: boolean;

  @Prop({
    type: String,
    required: false,
  })
  userSource?: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User).set(
  'versionKey',
  false,
);
