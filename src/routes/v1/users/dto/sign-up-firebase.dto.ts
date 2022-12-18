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
import { AddressUserDto } from './address-user.dt0';
import { Exclude, Type } from 'class-transformer';
import { RolesEnum } from '@decorators/roles.decorator';
import { Types } from 'mongoose';
import { ExchangeUserDto } from './exchange-user-dto';
// import SignUpDto from '@v1/auth/dto/sign-up.dto';

export class SignUpFirebaseDto {
  // @ApiProperty({ type: String})
  // @IsNotEmpty()
  // @IsString()
  // authId:string;

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

  @ApiProperty({ type: String, default: 1234567890 })
  @IsNotEmpty()
  // @IsNumber()
  readonly mobileNo: string;

  @ApiPropertyOptional({
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  readonly verified?: boolean = false;

  @IsOptional()
  @IsBoolean()
  readonly whatsappUpdate?: boolean = false;

  @IsOptional()
  @IsString()
  readonly userSource?: string;
}
