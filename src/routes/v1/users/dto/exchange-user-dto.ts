import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsIn, IsString } from 'class-validator';

export class ExchangeUserDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsIn(['binance', 'coindcx'])
  exchangeName: string;

  @ApiProperty({ type: String })
  @IsString()
  apiKey: string;

  @ApiProperty({ type: String })
  @IsString()
  apiSecret: string;

  @ApiProperty({ type: Number })
  @IsDate()
  timestamp: number;
}
