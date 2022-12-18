import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';
import { OtpUserDto } from './otp-user.dto';
import { AddressUserDto } from './address-user.dt0';
import { Exclude, Type } from 'class-transformer';
import { RolesEnum } from '@decorators/roles.decorator';
import { Types } from 'mongoose';
import { ExchangeUserDto } from './exchange-user-dto';
// import SignUpDto from '@v1/auth/dto/sign-up.dto';

export class SignUpDto {
  @ApiProperty({ type: String, default: 'Cryptocase' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(128)
  name: string;

  @ApiProperty({ type: String, default: 'hello@cryptocase.in' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @MinLength(3)
  @MaxLength(128)
  readonly email: string;

  @ApiProperty({ type: String, default: 'hello@cryptocase.in' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(128)
  password: string;

  @ApiProperty({ type: Number, default: 1234567890 })
  @IsNotEmpty()
  // @IsNumber()
  readonly mobileNo: string;

  @ApiProperty({ type: AddressUserDto })
  @IsOptional()
  @Type(() => AddressUserDto)
  address?: AddressUserDto = {
    area: null,
    locality: null,
    dist: null,
    state: null,
    country: null,
    pincode: null,
  };

  @ApiProperty({ type: 'enum', enum: RolesEnum, default: RolesEnum.USER })
  @Exclude()
  @IsOptional()
  // @IsNotEmpty()
  readonly role?: RolesEnum;

  @ApiProperty({ description: 'this is otp object' })
  @IsOptional()
  @Type(() => OtpUserDto)
  otp: OtpUserDto = {
    otpValue: null,
    expiryTime: null,
  };

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  readonly passwordResetTime: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  readonly refreshToken: string;

  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  readonly refreshTokenCreationTime: string;

  @ApiPropertyOptional({
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  readonly verified: boolean = false;

  @ApiProperty({ type: Array(ExchangeUserDto) })
  @IsOptional()
  exchange: ExchangeUserDto[];
}
