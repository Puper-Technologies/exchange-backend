import { Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { RolesEnum } from '@decorators/roles.decorator';
import { OtpUserDto } from '../dto/otp-user.dto';
import { ExchangeUserDto } from '../dto/exchange-user-dto';
import { Exclude, Transform } from 'class-transformer';
export default class UsersEntity {
  constructor(partial: Partial<UsersEntity>) {
    Object.assign(this, partial);
  }
  @ApiProperty({ type: String })
  authId?: string;

  @ApiProperty({ type: String })
  _id?: Types.ObjectId = new Types.ObjectId();

  @ApiProperty({ type: 'enum', enum: RolesEnum })
  // @Exclude()
  @Transform(({ value }) => value.name)
  role: RolesEnum;

  @ApiProperty({
    example: true,
    description: 'Is user email verified',
    type: Boolean,
  })
  verified?: boolean;

  @ApiProperty({ type: String })
  email: string;

  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  mobileNo: string;

  // @ApiProperty({ type: String })
  // @Exclude()
  // password: string;
  @ApiProperty({ type: String })
  @Exclude()
  password?: string;

  @ApiProperty({ type: Boolean })
  whatsappUpdate?: boolean = false;

  @ApiProperty({ type: String })
  userSource?: string;

  @ApiProperty({ type: OtpUserDto })
  @Exclude()
  otp?: OtpUserDto;

}
