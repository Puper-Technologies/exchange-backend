import {
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class SendOtpUserDto {
  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  // @IsNumber()
  mobileNo: string;

  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  iso: number;
}
