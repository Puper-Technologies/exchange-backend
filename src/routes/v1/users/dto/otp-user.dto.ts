import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class OtpUserDto {
  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  otpValue: number;

  @ApiProperty({ type: Number })
  @IsOptional()
  @IsNumber()
  expiryTime: number;
}
